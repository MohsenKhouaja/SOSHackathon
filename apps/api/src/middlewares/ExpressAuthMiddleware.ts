import { auth, fromNodeHeaders } from "@repo/auth";
import type { NextFunction, Request, Response } from "express";

const expressAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (user) {
    res.locals.user = user;
    next();
  } else {
    // biome-ignore lint/style/noMagicNumbers: <explanation>
    res.status(401).json({ error: "Unauthorized" });
  }
  return;
};

export default expressAuthMiddleware;
