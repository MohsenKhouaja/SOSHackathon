import winston from "winston";

// const logstashHost = process.env.NODE_ENV === "production" ? "logstash" : "localhost";

const formatter = winston.format.printf(({ level, message, timestamp }) => {
  const msg = `${timestamp} [${level}] : ${message} `;
  return msg;
});

// Create a factory function to ensure fresh logger instances
const createLoggerInstance = () => {
  const loggerInstance = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      // new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.splat(),
          formatter
        ),
      }),
    ],
  });

  loggerInstance.on("error", (error) => {
    // Use process.stderr as fallback to avoid circular logging
    process.stderr.write(`Logging error: ${error.message}\n`);
    if (error.stack) {
      process.stderr.write(`${error.stack}\n`);
    }
  });

  return loggerInstance;
};

// Export a singleton instance, but ensure it can be properly reinitialized
export const logger = createLoggerInstance();

// Cleanup function for graceful shutdown (helps with hot reload scenarios)
if (typeof process !== "undefined") {
  const cleanup = () => {
    logger.close();
  };

  process.on("beforeExit", cleanup);
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
