function errorHandler(err, req, res, next) {
    // 处理 Prisma 错误
    if (err.code === 'P2002') {
        return res.status(409).json({
            error: 'Unique constraint violation',
            fields: err.meta?.target
        });
    }

    // 处理校验错误
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: err.message,
            details: err.errors
        });
    }

    // 通用错误处理
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;