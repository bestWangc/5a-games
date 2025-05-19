import { PrismaClient } from '@prisma/client';
import { redisService } from './utils/redisHandler.js';

const prisma = new PrismaClient();
export const initUserInfo = async (req, res) => {
    //将用户信息存到redis
    const userInfo = await prisma.user.findMany({
        select: { id: true, address: true },
    });
    const cacheKey = "user_id_to_address";
    await redisService.del(cacheKey);

    userInfo.forEach(async (user) => {
        await redisService.hSetNX(cacheKey, `uid_${user.id}`, user.address);
    });
}