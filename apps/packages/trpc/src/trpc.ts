/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
/** biome-ignore-all lint/performance/useTopLevelRegex: <explanation> */
import { logger } from "@repo/logger";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";
import { env } from "./env";

/**
 * Sanitizes error messages for production to avoid exposing sensitive information
 * like SQL queries, internal paths, or stack traces.
 */
const sanitizeErrorMessage = (message: string): string => {
  // Check if the message contains SQL-related patterns
  const sqlPatterns = [
    /insert into/i,
    /select.*from/i,
    /update.*set/i,
    /delete from/i,
    /Failed query:/i,
    /params:/i,
    /\$\d+/, // Parameterized query markers like $1, $2
  ];

  const containsSql = sqlPatterns.some((pattern) => pattern.test(message));

  if (containsSql) {
    return "An internal error occurred. Please try again later.";
  }

  return message;
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    const isProduction = env.NODE_ENV === "production";

    // Sanitize the error message in production
    const sanitizedMessage =
      isProduction && error.code === "INTERNAL_SERVER_ERROR"
        ? sanitizeErrorMessage(shape.message)
        : shape.message;

    return {
      ...shape,
      message: sanitizedMessage,
      data: {
        ...shape.data,
        // In production, don't expose stack traces
        stack: isProduction ? undefined : shape.data.stack,
      },
    };
  },
  transformer: superjson,
  isDev: env.NODE_ENV === "development",
});
/**
 * Export reusable router and procedure helpers
 * that can be used throughout the router
 */
export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware; // Add this export
export const mergeRouters = t.mergeRouters; // Add this export
export const createCallerFactory = t.createCallerFactory; // Add this export

// Add this new subscription procedure
// export const createSubscriptionProcedure = (requiredRole?: number) =>
export const createSubscriptionProcedure = (requiredRole?: string | string[]) =>
  publicProcedure.use((opts) => {
    const { ctx } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (requiredRole) {
      const hasPermission =
        ctx.user.role === requiredRole ||
        (Array.isArray(requiredRole) && requiredRole.includes(ctx.user.role!));

      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User does not have the required permission",
        });
      }
    }

    return opts.next({
      ctx: {
        user: ctx.user,
        events: ctx.events, // Make sure events is available in context
      },
    });
  });

// export const protectedProcedure = (requiredRole?: number) =>
export const protectedProcedure = (requiredRole?: string | string[]) =>
  publicProcedure.use((opts) => {
    const { ctx } = opts;

    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    if (requiredRole) {
      const hasPermission =
        ctx.user.role === requiredRole ||
        (Array.isArray(requiredRole) && requiredRole.includes(ctx.user.role!));

      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User does not have the required permission",
        });
      }
    }

    return opts.next({
      ctx: {
        user: ctx.user,
        events: ctx.events,
      },
    });
  });

type Meta = {
  logType?: "system" | "user_interaction";
  ip?: string;
  agent?: string;
  user:
    | {
        id: string;
        name: string;
        emailVerified: boolean;
        email: string;
        createdAt: Date;
        updatedAt: Date;
        image?: string | null | undefined | undefined | undefined;
      }
    | null
    | undefined;
  path: string;
  type: string;
  durationMs: number;
  error?: {
    code: string;
    message: string;
    stackTrace?: string;
  };
  resourceType?: string;
  resourceId?: string;
};

export const loggingMiddleware = (description?: string) =>
  t.middleware(async (opts) => {
    const start = Date.now();

    const result = await opts.next();

    const durationMs = Date.now() - start;

    const meta: Meta = {
      logType: "system",
      ip: opts.ctx.req.ip,
      agent: opts.ctx.req.headers["user-agent"],
      user: opts.ctx.user,
      path: opts.path,
      type: opts.type,
      durationMs,
      error: result.ok
        ? undefined
        : {
            code: result.error.code,
            message: result.error.message,
            stackTrace:
              result.error.code === "INTERNAL_SERVER_ERROR"
                ? result.error.stack
                : undefined,
          },
    };

    // if (isUserInteraction(opts.path)) {
    //     meta = {
    //         ...meta,
    //         logType: "user_interaction",
    //         resourceType: opts.path.split(".")[0],
    //         resourceId: (opts.rawInput as any).id,
    //     };
    // }

    const logMessage = `${meta.user?.email ?? "anonymous"} @${meta.ip} ${description ? `${description}` : ""} "${meta.type} /${meta.path}" [${meta.error ? meta.error.code : "OK"}] [${durationMs}ms] ${meta.error ? `[Error: ${meta.error.message}]` : ""}`;

    if (result.ok) {
      logger.info(logMessage, meta);
    } else if (result.error.code === "INTERNAL_SERVER_ERROR") {
      logger.error(logMessage, meta);
      console.error(result.error.stack);
    } else {
      logger.warn(logMessage, meta);
      logger.warn(result.error.message, result.error);
      console.warn(result.error.stack);
    }

    return result;
  });
