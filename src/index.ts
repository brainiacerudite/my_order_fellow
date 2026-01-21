import app from "./app"
import config from "./config"
import { prisma } from "./shared/database/prisma";
import logger from "./shared/utils/logger"

const startServer = async () => {
    try {
        // connect db
        await prisma.$connect();
        logger.info("Database connection established");

        const server = app.listen(config.server.port, () => {
            logger.info(`Server running on port ${config.server.port}`)
            logger.info(`Environment: ${config.server.environment}`)
        })

        // Graceful shutdown
        const shutdown = async (signal: string) => {
            logger.info(`${signal} received. Closing HTTP server...`);

            server.close(async () => {
                logger.info("HTTP server closed.");

                // Close DB connection
                logger.info("Disconnecting from database...");
                await prisma.$disconnect();
                logger.info("Database disconnected. Exiting process.");

                process.exit(0);
            });
        };

        process.on("SIGTERM", () => shutdown("SIGTERM"));
        process.on("SIGINT", () => shutdown("SIGINT"));
    } catch (error) {
        logger.error("Failed to start server:", error)
        await prisma.$disconnect();
        process.exit(1)
    }
}

startServer()