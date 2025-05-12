import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getIO } from '../websocket/socketHandler.js';
import { errorRes, successRes } from '../utils/responseHandler.js';
import { redisService } from '../utils/redisHandler.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

// 游戏状态存储
const gameState = {};

export const initGame = async (req, res) => {
	const addr = req.body?.address?.trim();
	if (!addr) {
		return errorRes(res, 'Address is required');
	}
	try {
		// 1. 获取或创建用户
		const user = await prisma.user.upsert({
			where: { address: addr },
			create: { address: addr },
			update: {},
			select: { id: true, coins: true },
		});
		const cacheKey = "user_id_to_address";
		await redisService.hSetNX(cacheKey, `uid_${user.id}`, addr);

		// 2. 获取或创建游戏
		const activeGame = await prisma.game.findFirst({
			where: {
				status: {
					not: "done"
				}
			},
		});

		const gameId = activeGame.id;

		// 3. 并行查询游戏人数和用户房间信息
		const [gameCount, getGameInfo] = await Promise.all([
			prisma.game_play.count({ where: { game_id: gameId } }),
			prisma.game_play.findUnique({
				where: {
					user_id_game_id: {
						user_id: user.id,
						game_id: gameId,
					},
				},
				select: { room_id: true },
			}),
		]);

		// 4. 获取本局游戏中所有user 信息
		const gamePlayInfo = await prisma.game_play.findMany({
			where: { game_id: gameId },
			select: { room_id: true, bet_coin: true, user_id: true },
			orderBy: { id: 'desc' },
		});

		let roomBet = {};
		let roomUsers = {};
		if (gamePlayInfo) {
			const processAllRooms = async function () {
				for (const info of gamePlayInfo) {
					const tempRoomId = info.room_id;

					// 处理房间下注金额
					roomBet[tempRoomId] = (roomBet[tempRoomId] || 0) + info.bet_coin;

					// 初始化用户数组
					if (!roomUsers[tempRoomId]) {
						roomUsers[tempRoomId] = [];
					}

					if (roomUsers[tempRoomId].length < 6) {
						// 从Redis获取用户地址
						const userAddr = await redisService.hGet(cacheKey, `uid_${info.user_id}`);

						if (userAddr) {
							roomUsers[tempRoomId].push({
								user_id: info.user_id,
								user_addr: userAddr,
								user_bet: info.bet_coin,
							});
						}
					}
				}
			}
			await processAllRooms();
		}
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

		// 6. 构造返回数据
		const resData = {
			user: {
				uid: user.id,
				balance: user.coins,
				selectRoomId: getGameInfo?.room_id,
			},
			roomBet,
			roomUsers,
			game: {
				gameId,
				status: activeGame.status,
				userCount: gameCount,
			},
			token,
		};

		const io = getIO();
		io.emit('user_joined', { userId: user.id, type: "user_joined", address: addr });

		return successRes(res, resData);
	} catch (err) {
		return errorRes(res, err.message);
	}
};

export const placeBet = async (req, res) => {
	try {
		const { amount, roomId, gameId } = req.body;
		const realAmount = Number(amount.trim());
		if (realAmount <= 0) {
			return errorRes(res, 'bet amount must be greater than 0');
		}
		const user_id = req.user.id;
		let user = await prisma.user.findUnique({
			where: { id: user_id }
		});
		if (user.coins < realAmount) {
			return errorRes(res, 'Insufficient balance');
		}

		const [userAfterBet, gameInfo] = await prisma.$transaction([
			prisma.user.update({
				where: { id: user_id },
				data: { coins: { decrement: realAmount } }
			}),
			prisma.game_play.update({
				where: {
					user_id_game_id: {
						user_id: user_id,
						game_id: gameId
					}
				},
				data: { bet_coin: { increment: realAmount } }
			})
		]);
		const cacheKey = `bet_${gameInfo.id}_${roomId}`;
		const allAmount = await redisService.incrByWithExpire(cacheKey, realAmount);
		//通知其余人增加amount
		const io = getIO();
		io.emit('room_add_bet', { roomId: roomId, type: "room_add_bet", amount: allAmount, userId: user_id });

		return successRes(res, { userBalance: userAfterBet.coins });
	} catch (err) {
		return errorRes(res, err.message);
	}
};

export const selectRoom = async (req, res) => {

	const user_id = req.user.id
	if (!user_id) {
		return res.status(400).json({ error: 'user not found' });
	}
	const { roomId, gameId } = req.body;
	if (!roomId || !gameId) {
		return errorRes(res, 'Room is required');
	}
	try {
		const game = await prisma.game.findUnique({
			where: { id: gameId }
		});
		if (!game || game.status == 'done') {
			return errorRes(res, 'Game is not active');
		}
		await prisma.game_play.upsert({
			where: {
				user_id_game_id: {  // 假设有复合唯一键
					user_id: user_id,
					game_id: gameId
				}
			},
			update: { room_id: roomId },
			create: {
				user_id: user_id,
				game_id: gameId,
				room_id: roomId,
				bet_coin: 0  // 其他必填字段
			}
		});

		const io = getIO();
		io.emit('move_to_room', {
			type: 'move_to_room',
			userId: user_id,
			gameId: gameId,
			roomId
		});

		//查询现在游戏人数 满20开始游戏倒计时
		const gameCount = await prisma.game_play.count({
			where: {
				game_id: gameId,
				bet_coin: { gt: 0 }
			}
		});
		//todo count change to 20
		if (gameCount >= 5) {
			await prisma.game.update({
				where: { id: gameId },
				data: { status: 'playing' }
			});
			io.emit('game_start', { gameId: gameId, type: "game_start" });
			setTimeout(() => {
				startCountdown(gameId, io); // 开始服务端倒计时
			}, 1000);
		}

		return successRes(res, { message: 'Room selected successfully' });
	} catch (err) {
		return errorRes(res, err.message);
	}
};

function startCountdown(gameId, io, duration = 10) {
	gameState[gameId] = {
		remainingTime: duration,
		isCalculating: false,
		timer: null
	};

	// 每秒更新倒计时
	gameState[gameId].timer = setInterval(async () => {
		gameState[gameId].remainingTime--;

		// 广播给所有客户端
		io.emit('countdown_update', {
			type: "countdown_update",
			gameId: gameId,
			time: gameState[gameId].remainingTime
		});
		console.log("countdown: " + gameState[gameId].remainingTime);

		// 倒计时结束且未开始结算
		if (gameState[gameId].remainingTime <= 0 && !gameState[gameId].isCalculating) {
			clearInterval(gameState[gameId].timer);
			gameState[gameId].isCalculating = true;

			// 1. 通知客户端倒计时结束
			//随机选择1-8的房间
			const randomRoomId = crypto.randomInt(1, 9);
			io.emit('countdown_end', { gameId: gameId, type: "countdown_end", resultRoomId: randomRoomId });

			// 2. 奖励结算
			// const rewards = await calculateRewards(gameId,randomRoomId);

			// 3. 广播奖励结果
			// io.emit('reward_calculated', {
			// 	gameId: gameId,
			// 	rewards: rewards
			// });

			// 4. 清理状态
			delete gameState[gameId];
		}
	}, 1000);
}

async function calculateRewards(gameId) {
	// 实际项目中这里可能是数据库查询 + 复杂逻辑

	return [
		{ playerId: 'player1', reward: 'Gold: 1000' },
		{ playerId: 'player2', reward: 'Gold: 800' }
	];
}

export const testJoin = async (req, res) => {
	try {
		const io = getIO();
		const userId = req.params.id;
		io.emit('user_joined', { userId: userId, type: "user_joined", address: "0x3A30103644D08Fd4eA87526625D59421895607C3" });
		res.json({ message: `User ${userId} joined room successfully` });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
export const testMoveTo = async (req, res) => {
	try {
		const io = getIO();
		const userId = req.params.id;
		// io.emit('user_joined', {userId: userId,type: "user_joined"});
		io.emit('move_to_room', { userId: userId, type: "move_to_room" });
		res.json({ message: `User ${userId} joined room successfully` });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
export const testMoveBack = async (req, res) => {
	try {
		const io = getIO();
		// io.emit('user_joined', {userId: userId,type: "user_joined"});
		io.emit('move_back', { type: "move_back" });
		res.json({ message: `User joined room successfully` });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

