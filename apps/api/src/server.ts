import { auth, toNodeHandler } from "@repo/auth";
// import morgan from "morgan";
import { corsOptions } from "@repo/shared";
import { appRouter, createContext, trpcExpress } from "@repo/trpc";
import { json, urlencoded } from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { expressUploadRouter } from "./routers/upload-router";

export const createServer = (): Express => {
  const app = express();
  app
    .use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
              "'self'",
              "'unsafe-inline'",
              "https://cdn.jsdelivr.net",
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
      })
    )
    // .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(cors(corsOptions))
    .use(cookieParser())
    .all("/api/auth/*splat", toNodeHandler(auth))
    .use("/uploads", express.static("public/uploads"))
    .use(json())
    .use(
      "/api/trpc",
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    )
    .use("/api/upload", expressUploadRouter)
    .get("/health", (_, res) => res.json({ ok: true }));

  return app;
};
