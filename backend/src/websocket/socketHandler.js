import jwt from 'jsonwebtoken';
import { verifyToken } from '../utils/auth.js';
import { Server } from 'socket.io';
import { broadcastRoomUpdate, broadcastGameStart, broadcastGameEnd } from '../utils/messageHandler.js';
import { PrismaClient } from '@prisma/client';

const ALLOWED_DOMAINS = new Set([
    'yourdomain.com',
    'api.yourdomain.com',
    'localhost'
]);

const prisma = new PrismaClient();

let ioInstance;

export const initSocketServer = (server) => {

    const io = initSocketIO(server);

    const token = jwt.sign({ id: 12 }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log(token);
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            console.log(socket.handshake.auth);
            if (!token) {
                throw new Error('AUTH:NO_TOKEN');
            }
            // 2. 使用您现有的verifyToken验证
            const decoded = await verifyToken(token).catch(err => {
                throw new Error(`AUTH:INVALID_TOKEN:${err.message}`);
            });
            console.log(decoded);

            //todo 开启域名验证
            // const clientDomain = getRootDomain(socket.handshake.headers.origin);
            // if (!decoded.domain || !ALLOWED_DOMAINS.has(decoded.domain)) {
            //     throw new Error('AUTH:INVALID_DOMAIN');
            // }

            // // 4. 对比Token中的域名和实际请求域名
            // if (decoded.domain !== clientDomain) {
            //     throw new Error('AUTH:DOMAIN_MISMATCH');
            // }

            // 5. 附加信息到socket对象（保持您原有逻辑）
            socket.user = {
                id: decoded.id,
                _rawToken: token.slice(-8) // 记录token尾号用于审计
            };

            next();
        } catch (err) {
            const [type, code, message] = err.message.split(':');
            const error = new Error(message || 'Authentication failed');
            error.code = code || 'AUTH_ERROR';
            error.type = type || 'AUTH';

            // 记录验证失败的元数据
            error.metadata = {
                clientIp: socket.handshake.address,
                attemptedDomain: socket.handshake.headers.origin,
                timestamp: new Date().toISOString()
            };
            next(error);
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected:`);

        socket.on('error', (err) => {
            console.error(`[${socket.id}] Socket错误:`, {
                error: err.stack || err.message,
                time: new Date().toISOString()
            });
        });

        socket.on('user_joined', async (data) => {
            console.log("data", data);
            io.emit('user_joined', data);
        });

        // 用户投入金币
        socket.on('place_bet', async (betAmount) => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: socket.user.id },
                    include: { room: true }
                });
                if (!user.room) {
                    socket.emit('error', 'User not in a room');
                    return;
                }
                if (user.balance < betAmount) {
                    socket.emit('error', 'Insufficient balance');
                    return;
                }
                await prisma.$transaction([
                    prisma.user.update({
                        where: { id: user.id },
                        data: { balance: { decrement: betAmount } }
                    }),
                    prisma.bet.create({
                        data: {
                            userId: user.id,
                            roomId: user.roomId,
                            amount: betAmount
                        }
                    })
                ]);
                io.to(user.roomId.toString()).emit('bet_placed', {
                    userId: user.id,
                    amount: betAmount
                });
            } catch (err) {
                socket.emit('error', err.message);
            }
        });

        // 用户离开房间
        socket.on('leave_room', async () => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: socket.user.id }
                });
                if (user.roomId) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { roomId: null }
                    });
                    socket.leave(user.roomId.toString());
                    io.to(user.roomId.toString()).emit('user_left', {
                        userId: user.id
                    });
                }
            } catch (err) {
                socket.emit('error', err.message);
            }
        });

        // 用户退出游戏
        socket.on('disconnect', async () => {
            try {
                const user = await prisma.user.findUnique({
                    where: { id: socket.user.id }
                });
                if (user.roomId) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { roomId: null }
                    });
                    if (user.roomId) {
                        socket.leave(user.roomId.toString());
                        io.to(user.roomId.toString()).emit('user_left', {
                            userId: user.id
                        });
                    }
                }
            } catch (err) {
                console.error('Disconnect error:', err);
            }
        });
    });

    // 游戏逻辑
    // setInterval(async () => {
    //     const activeRoom = await prisma.game.findFirst({
    //         where: { status: "waiting" }
    //     });
    //     if (!activeRoom) return;

    //     const usersInRoom = await prisma.user.count({
    //         where: { roomId: activeRoom.id }
    //     });

    //     if (usersInRoom >= 20) {
    //         // 开始游戏
    //         broadcastGameStart(io, activeRoom.id);
    //         setTimeout(async () => {
    //             // 游戏结束逻辑
    //             broadcastGameEnd(io, activeRoom.id);
    //             // 清空房间金币并分发
    //             await prisma.$transaction(async () => {
    //                 // 清空房间金币并分发逻辑
    //             });
    //             // 创建新房间
    //             await prisma.room.create({
    //                 data: {
    //                     name: `Room ${Date.now()}`,
    //                     isActive: true
    //                 }
    //             });
    //         }, 60000);
    //     }
    // }, 5000);
};

const getRootDomain = (url) => {
    if (!url) return null;
    try {
        const domain = new URL(url).hostname;
        return domain.split('.').slice(-2).join('.');
    } catch {
        return url;
    }
};


export const getIO = () => {
    if (!ioInstance) {
        ioInstance = initSocketIO();
    };
    return ioInstance;
};

export const initSocketIO = (server) => {
    ioInstance = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: false
        },
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000 // 允许2分钟内断线恢复
        }
    });
    return ioInstance;
};