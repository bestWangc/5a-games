import { PrismaClient } from '@prisma/client';
import { getIO } from './websocket/socketHandler.js';
import { redisService } from './utils/redisHandler.js';


export const runBot = async function main() {
    const prisma = new PrismaClient();
    //判断游戏是否在wating状态
    const game = await prisma.game.findFirst({
        where: {
            status: {
                not: "done"
            }
        },
    });
    if (!game) {
        return;
    }
    const gameId = game.id;

    const gameCount = await prisma.game_play.count({
        where: {
            game_id: gameId,
            bet_coin: { gt: 0 }
        }
    });
    if (gameCount >= 20) {
        return;
    }
    //确保每个房间都要有用户bet  如果没有  就加入机器人
    const gamePlay = await prisma.game_play.groupBy({
        by: ['room_id'],
        where: {
            game_id: gameId,
        },
        _sum: {
            bet_coin: true   // 计算每个组的bet总和
        }
    });
    if (!gamePlay) {
        return;
    }
    const allRoomId = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = 0; i < gamePlay.length; i++) {
        const room_id = gamePlay[i].room_id;
        const bet_coin = gamePlay[i]._sum.bet_coin;
        if (bet_coin > 0) {
            const index = allRoomId.indexOf(room_id);
            if (index > -1) {
                allRoomId.splice(index, 1);
            }
        }
    }
    //随机选一个房间增加机器人
    const randomRoomId = allRoomId[Math.floor(Math.random() * allRoomId.length)];
    const users = await prisma.user.findMany({
        where: {
            is_bot: 1
        },
        select: { id: true }
    });
    const userIds = users.map(user => user.id);
    //随机选一个用户
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
    console.log("randomUserId", randomUserId);
    const randomBet = Math.floor(Math.random() * 10) + 1;
    //插入数据
    const cacheKey = "user_id_to_address";
    const userAddr = await redisService.hGet(cacheKey, `uid_${randomUserId}`);
    //50%的概率加入机器人
    const io = getIO();
    if (Math.random() > 0.5) {
        io.emit('user_joined_room', { userId: randomUserId, type: "user_joined_room", address: userAddr });
        return;
    }
    //查询是否存在
    const gamePlayInfo = await prisma.game_play.findFirst({
        where: {
            user_id: randomUserId,
            game_id: gameId,
        },
        select: { id: true }
   });
    if (!gamePlayInfo) {
        await prisma.game_play.create({
            data: {
                game_id: gameId,
                user_id: randomUserId,
                room_id: randomRoomId,
                bet_coin: randomBet
            }
        });
        const result = await prisma.$queryRaw`
            SELECT SUM(bet_coin) as total
            FROM game_play
            WHERE game_id = ${gameId} AND room_id = ${randomRoomId}
        `;
        const totalBetAmount = Number(result[0]?.total) || 0;
        const cacheKey = "user_id_to_address";
        const userAddr = await redisService.hGet(cacheKey, `uid_${randomUserId}`);

        const userInfo = {
            user_id: randomUserId,
            user_addr: userAddr
        }
        io.emit('room_add_user', { roomId: randomRoomId, type: "room_add_user", roomAmount: totalBetAmount, userId: randomUserId, userInfo });
    }
}


