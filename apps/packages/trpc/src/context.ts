/** biome-ignore-all lint/style/useNamingConvention: yes */
import type { IncomingMessage } from "node:http";
import { fromNodeHeaders } from "@repo/auth";
import { db } from "@repo/db";
import { logger } from "@repo/logger";
import type { AuthenticatedUser, Session } from "@repo/shared";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import cookie from "cookie";
import type { Request, Response } from "express";
import { authService } from "./delivery/services/auth-service";
import { appEvents } from "./events";

type ContextResponse = {
  user?: AuthenticatedUser;
  session?: Session;
  req: Request;
  res: Response;
  events: typeof appEvents;
};

// Helper function to get user from WebSocket request
const getUserFromWsRequest = async (req: IncomingMessage) => {
  try {
    // Use authService.getCurrentUser to get enriched user data
    const sessionData = await authService.getCurrentUser(
      db,
      fromNodeHeaders(req.headers)
    );
    return sessionData?.user;
  } catch (error) {
    logger.error("WebSocket auth error:", error);
    return;
  }
};

// Express context
export const createContext = async ({
  req,
  res,
}: CreateExpressContextOptions): Promise<ContextResponse> => {
  // Use authService.getCurrentUser to get enriched user data with deliveryCompanyId/businessId
  const sessionData = await authService.getCurrentUser(
    db,
    fromNodeHeaders(req.headers)
  );
  return {
    user: sessionData?.user as AuthenticatedUser | undefined,
    session: sessionData?.session as Session | undefined,
    req,
    res,
    events: appEvents,
  };
};

// WebSocket context - adjusted to match Express context type
export const createWSContext = async ({
  req,
}: CreateWSSContextFnOptions): Promise<ContextResponse> => {
  const user = await getUserFromWsRequest(req);

  // Create Express-like req and res objects
  const mockReq = {
    cookies: cookie.parse(req.headers.cookie || ""),
    headers: req.headers,
    ip: req.socket.remoteAddress,
    // Add other properties as needed
  } as unknown as Request;

  const mockRes = {
    clearCookie: () => {
      // intentionally left empty block
    },
    cookie: () => {
      // intentionally left empty block
    },
    // Add other properties as needed
  } as unknown as Response;

  return {
    user: user as AuthenticatedUser | undefined,
    req: mockReq,
    res: mockRes,
    events: appEvents,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
export type WSContext = Awaited<ReturnType<typeof createWSContext>>;
