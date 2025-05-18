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
		if (!activeGame) {
			return errorRes(res, 'No active game');
		}

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

		const resData = {
			user: {
				uid: user.id,
				balance: user.coins.toString(),
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
		const formatAmount = realAmount * 10 ** 6;
		if (realAmount <= 0) {
			return errorRes(res, 'bet amount must be greater than 0');
		}
		const user_id = req.user.id;
		let user = await prisma.user.findUnique({
			where: { id: user_id }
		});
		if (user.coins < formatAmount) {
			return errorRes(res, 'Insufficient balance');
		}

		const [userAfterBet, gameInfo] = await prisma.$transaction([
			prisma.user.update({
				where: { id: user_id },
				data: { coins: { decrement: formatAmount } }
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
		const result = await prisma.$queryRaw`
			SELECT SUM(bet_coin) as total
			FROM game_play
			WHERE game_id = ${gameId} AND room_id = ${roomId}
		`;
		const totalBetAmount = Number(result[0]?.total) || 0;
		//通知其余人增加amount
		const io = getIO();
		io.emit('room_add_bet', { roomId: roomId, type: "room_add_bet", roomAmount: totalBetAmount, userAmount: gameInfo.bet_coin, userId: user_id });

		return successRes(res, { userBalance: userAfterBet.coins.toString() });
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
				// bet_coin: { gt: 0 }
			}
		});
		//todo count change to 20
		if (gameCount >= 20) {
			await prisma.game.update({
				where: { id: gameId },
				data: { status: 'playing' }
			});
			io.emit('game_start', { gameId: gameId, type: "game_start" });
			setTimeout(() => {
				startCountdown(gameId, io); // 开始服务端倒计时
			}, 500);
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
			// const randomRoomId = crypto.randomInt(1, 9);
			const randomRoomId = 4;
			io.emit('countdown_end', { gameId: gameId, type: "countdown_end", resultRoomId: randomRoomId });
			// 4. 清理状态
			delete gameState[gameId];
			calculateRewards(gameId, randomRoomId);
		}
	}, 1000);
}

//todo 如果有错误 重新计算1次
async function calculateRewards(gameId, resultRoomId) {
	console.log("开始结算奖励");
	// 1. 获取所有参与者的信息
	const gamePlay = await prisma.game_play.findMany({
		where: {
			game_id: gameId
		},
		select: {
			user_id: true,
			room_id: true,
			bet_coin: true
		}
	});
	// 2. 根据房间号计算赢家
	//根据房间获取失败玩家的bet总额
	let loseCoins = 0;
	const roomBetAmount = {}
	for (const key in gamePlay) {
		if (Object.prototype.hasOwnProperty.call(gamePlay, key)) {
			const element = gamePlay[key];
			if (element.room_id == resultRoomId) {
				loseCoins += element.bet_coin;
			} else {
				if (roomBetAmount[element.room_id]) {
					roomBetAmount[element.room_id] += element.bet_coin;
				} else {
					roomBetAmount[element.room_id] = element.bet_coin;
				}
			}

		}
	}
	const roomBetCount = Object.entries(roomBetAmount).reduce((count, [key, value]) => {
		return value !== 0 ? count + 1 : count;
	}, 0);
	//将奖励代币均分到其余房间
	const burnCoins = loseCoins * 0.05;
	const coinPerRoom = (loseCoins * 0.95) / roomBetCount;
	//根据每个参与者bet的比例瓜分代币
	const userRewards = {};
	for (const key in gamePlay) {
		if (Object.prototype.hasOwnProperty.call(gamePlay, key)) {
			const element = gamePlay[key];
			if (roomBetAmount[element.room_id]) {
				//计算每个参与者应得的奖励
				const reward = coinPerRoom * element.bet_coin / roomBetAmount[element.room_id];
				userRewards[element.user_id] = reward + element.bet_coin;
			}
		}
	}

	try {
		const batchSize = 1000
		await prisma.$transaction(async (tx) => {
			// 清空当前会话的临时数据（并发安全）
			await tx.$executeRaw`TRUNCATE TABLE batch_rewards_temp`

			// 分批插入临时表
			const entries = Object.entries(userRewards)
			for (let i = 0; i < entries.length; i += batchSize) {
				const batch = entries.slice(i, i + batchSize)
				await tx.batch_rewards_temp.createMany({
					data: batch.map(([userId, reward]) => ({
						user_id: parseInt(userId),
						reward: BigInt(parseInt(reward * 10 ** 6)),
						game_id: gameId
					}))
				});
			}

			// 执行批量更新（原生SQL提升性能）
			await tx.$executeRaw`
				UPDATE game_play gp
				JOIN batch_rewards_temp tmp ON gp.user_id = tmp.user_id
				SET gp.reward = tmp.reward
				WHERE gp.game_id = ${gameId}
			`;
			await tx.$executeRaw`
				UPDATE game_play SET status = 1 WHERE game_id = ${gameId}
			`;
			//给用户余额增加
			await tx.$executeRaw`
				UPDATE user u
				JOIN batch_rewards_temp tmp ON u.id = tmp.user_id
				SET u.coins = u.coins + tmp.reward;
			`;
			await tx.game.update({
				where: { id: gameId },
				data: { status: "done", win_room_id: resultRoomId, end_time: Math.floor(Date.now() / 1000) }
			});
			//往game 中新增一条数据
			await tx.game.create({
				data: {}
			});
		})
	} catch (err) {
		console.log(err);
	} finally {
		// await prisma.$executeRaw`TRUNCATE TABLE batch_rewards_temp`
	}
}

export const getGameRewards = async (req, res) => {
	// const user_id = req.user.id
	const user_id = 1
	if (!user_id) {
		return res.status(400).json({ error: 'user not found' });
	}
	const { gameId } = req.body;
	if (!gameId) {
		return errorRes(res, 'Game is required');
	}
	try {
		const activeGame = await prisma.game.findFirst({
			where: {
				id: gameId,
				status: "done",
			},
			select: { win_room_id: true }
		});
		if (!activeGame) {
			return errorRes(res, 'Game is not completed');
		}
		//获取当前游戏的所有参与者信息
		const gamePlay = await prisma.game_play.findFirst({
			where: {
				game_id: gameId,
				user_id: user_id
			},
			select: {
				reward: true,
				status: true,
				room_id: true,
				bet_coin: true
			}
		});
		let reward = 0
		let hasRes = gamePlay.status == 1
		let isWin = activeGame.win_room_id == gamePlay.room_id ? false : true;
		let betCoin = gamePlay.bet_coin;

		if (gamePlay.length > 0) {
			reward = gamePlay.reward;
		}
		return successRes(res, { reward, hasRes, isWin, betCoin });
	} catch (err) {
		return errorRes(res, err.message);
	}
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
export const testGameEnd = async (req, res) => {
	try {
		const io = getIO();
		// io.emit('user_joined', {userId: userId,type: "user_joined"});
		io.emit('game_end', { type: "game_end" });
		res.json({ message: `User joined room successfully` });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
export const testCalculateRewards = async (req, res) => {
	try {
		calculateRewards(1, 7)
		res.json({ message: `successfully` });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

