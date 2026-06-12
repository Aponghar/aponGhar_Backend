let io;

const onlineUsers = new Map();

const initializeSocket = (server) => {
    const allowedOrigins = (
        process.env.ALLOWED_ORIGINS || 'http://localhost:3000'
    )
        .split(',')
        .map(origin => origin.trim());

    io = require('socket.io')(server, {
        cors: {
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Middleware to verify JWT token
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: Token missing'));
        }

        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (error) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.userId);

        // REGISTER USER
        socket.on('register_user', () => {
            onlineUsers.set(String(socket.userId), socket.id);
            console.log(`User ${socket.userId} online`);
        });

        // DISCONNECT
        socket.on('disconnect', () => {

                        for (

                            const [
                                userId,
                                socketId
                            ]

                            of onlineUsers

                        ) {

                            if (
                                socketId === socket.id
                            ) {

                                onlineUsers.delete(
                                    userId
                                );

                                break;
                            }
                        }

                        console.log(
                            "User disconnected:",
                            socket.id
                        );
                    }
                );
            }
        );

        return io;
};



const emitToUser =
    (
        userId,
        event,
        data
    ) => {

        const socketId =
            onlineUsers.get(
                String(userId)
            );

        if (socketId) {

            io.to(socketId).emit(

                event,

                data
            );
        }
};



const getOnlineUsers =
    () => {

        return Array.from(
            onlineUsers.keys()
        );
};



module.exports = {

    initializeSocket,

    emitToUser,

    getOnlineUsers
};