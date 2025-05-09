import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getIO } from '../websocket/socketHandler.js';
import { errorRes, successRes } from '../utils/responseHandler.js';
import { redisService } from '../utils/redisHandler.js';

const prisma = new PrismaClient();

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

		// 2. 获取或创建游戏
		const activeGame = await prisma.game.findFirst({
			where: { status: "waiting" },
		}) ?? await GameSercvice.createGame();

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

		// 4. 计算每个房间的投注总额
		const roomInfo = await prisma.game_play.groupBy({
			where: { game_id: gameId },
			by: ['room_id'],
			_sum: { bet_coin: true },
		});

		let roomBet = [];
		if (roomInfo) {
			roomInfo.forEach(room => {
				roomBet.push({ room_id: room.room_id, bet_coin: room._sum.bet_coin });
			});
		}
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

		// 6. 构造返回数据
		const resData = {
			user: {
				uid: user.id,
				balance: user.coins,
				selectRoomId: getGameInfo?.room_id,
			},
			room: roomInfo.map(room => ({
				room_id: room.room_id,
				bet_coin: room._sum.bet_coin,
			})),
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
		if (!game || game.status != 'waiting') {
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
		return successRes(res, { message: 'Room selected successfully' });
	} catch (err) {
		return errorRes(res, err.message);
	}
};

export const testJoin = async (req, res) => {
	try {
		const io = getIO();
		const userId = req.params.id;
		io.emit('user_joined', { userId: userId, type: "user_joined" });
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
		const userId = req.params.id;
		// io.emit('user_joined', {userId: userId,type: "user_joined"});
		io.emit('move_back', { userId: userId, type: "move_back" });
		res.json({ message: `User ${userId} joined room successfully` });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

