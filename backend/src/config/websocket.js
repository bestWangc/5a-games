const { Server } = require('socket.io');

module.exports = (httpServer) => {
    const io = new Server(httpServer, {
        path: process.env.WS_PATH,
        cors: {
            origin: process.env.NODE_ENV === 'development'
                ? '*'
                : 'https://yourdomain.com',
            methods: ['GET', 'POST']
        }
    });

    return io;
};