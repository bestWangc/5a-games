const prisma = require('../utils/prisma');

class UserController {
    // 创建用户
    static async createUser(req, res, next) {
        try {
            const { username, email } = req.body;

            const user = await prisma.user.create({
                data: { username, email },
                select: { id: true, username: true, email: true }
            });

            res.status(201).json(user);
        } catch (err) {
            next(err);
        }
    }

    // 获取用户列表 (带分页)
    static async getUsers(req, res, next) {
        try {
            const { page = 1, pageSize = 10 } = req.query;

            const users = await prisma.user.findMany({
                skip: (page - 1) * pageSize,
                take: Number(pageSize),
                select: {
                    id: true,
                    username: true,
                    email: true,
                    _count: { select: { posts: true } }
                }
            });

            res.json(users);
        } catch (err) {
            next(err);
        }
    }

    // 其他方法...
}

module.exports = UserController;