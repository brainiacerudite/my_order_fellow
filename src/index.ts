import app from "./app"
import config from "./config"
import logger from "./shared/utils/logger"

const startServer = async () => {
    try {
        // connect db

        app.listen(config.server.port, () => {
            logger.info(`Server running on port ${config.server.port}`)
            logger.info(`Environment: ${config.server.environment}`)
        })
    } catch (error) {
        logger.error("Failed to start server:", error)
        process.exit(1)
    }
}

// Graceful shutdown
process.on("SIGTERM", () => {
    logger.info("SIGTERM received, shutting down gracefully");

    process.exit(0);
});

process.on("SIGINT", () => {
    logger.info("SIGINT received, shutting down gracefully");

    process.exit(0);
});


startServer()