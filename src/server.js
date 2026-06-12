require("dotenv").config();

const { validateEnvironment } = require("./config/environment");

const http = require("http");

const app = require("./app");

const pool = require("./config/db");

const logger = require("./config/logger");

const { initializeSocket } = require("./config/socket");

// Validate environment variables
validateEnvironment();

const PORT = process.env.PORT || 5000;

const sanitizeErrorMessage = (message) =>
    String(message).replace(
        /mysql:\/\/([^:\s]+):([^@\s]+)@/gi,
        'mysql://$1:<redacted>@'
    );



const startServer =
    async () => {

        try {

            // TEST DATABASE CONNECTION
            const connection =
                await pool.getConnection();

            console.log(
                "MySQL Database Connected"
            );

            connection.release();



            // CREATE HTTP SERVER
            const server =
                http.createServer(app);



            // INITIALIZE SOCKET.IO
            initializeSocket(server);



            // START SERVER
            server.listen(

                PORT,

                () => {

                    console.log(
                        `Server running on port ${PORT}`
                    );

                    logger.info(
                        `Server running on port ${PORT}`
                    );
                }
            );

        } catch (error) {
            const message =
                sanitizeErrorMessage(error.message);

            console.error(

                "Server startup failed:",

                message
            );

            logger.error(
                message
            );

            process.exit(1);
        }
};



startServer();
