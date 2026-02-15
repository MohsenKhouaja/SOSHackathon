import { logger } from "@repo/logger";
import { env } from "./env";
import { createServer } from "./server";

// Log process info for debugging
logger.info(`Starting server with PID: ${process.pid}`);
logger.info(`Node version: ${process.version}`);

const DEFAULT_PORT = 5000;
const port = env.PORT || DEFAULT_PORT;
const server = createServer();

// Listen on all network interfaces
const httpServer = server.listen(port, "0.0.0.0", () => {
  logger.info(`Express is running in ${process.env.NODE_ENV} on port ${port}!`);
  logger.info(`Listening on http://0.0.0.0:${port}`);
  logger.info(`Listening on http://127.0.0.1:${port}`);
  logger.info(`Listening on http://localhost:${port}`);
});

process.on("uncaughtException", (error, origin) => {
  logger.error(`Uncaught exception: ${error.message}`, {
    error,
    origin,
  });
  logger.error(error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled promise rejection [${reason}]`, { reason });
  logger.error(reason);
});

// Cleanup on server close
const SHUTDOWN_TIMEOUT = 10_000;

const shutdown = (signal: string) => {
  logger.info(`${signal} received. Shutting down server gracefully...`);

  // Close HTTP server first
  httpServer.close((err) => {
    if (err) {
      logger.error("Error closing HTTP server", err);
      process.exit(1);
    }

    logger.info("HTTP server closed");
    process.exit(0);
  });

  // Force close after timeout
  setTimeout(() => {
    logger.error("Forcing shutdown after timeout");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
