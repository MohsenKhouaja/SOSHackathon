import { fromNodeHeaders } from "@repo/auth";
import { db } from "@repo/db";
import { signupSchema } from "@repo/validators";
import { z } from "zod";
import {
  loggingMiddleware,
  protectedProcedure,
  publicProcedure,
  router,
} from "../../trpc";
import { authService } from "../services/auth-service";

/**
 * Auth router handles authentication-related operations
 */
export const authRouter = router({
  /**
   * Sign up a new user
   * This is a public procedure that creates a new user account
   */
  signup: publicProcedure
    .use(loggingMiddleware("User signup"))
    .input(signupSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await authService.signup(
        db,
        fromNodeHeaders(ctx.req.headers),
        input
      );

      // Forward Set-Cookie headers from Better Auth to the client
      const setCookieHeader = result.headers.get("set-cookie");
      if (setCookieHeader) {
        ctx.res.setHeader("set-cookie", setCookieHeader);
      }

      return {
        user: result.user,
      };
    }),

  /**
   * Get current authenticated user with session and organization info
   * This replaces the useSession hook from auth client
   * Returns null if not authenticated instead of throwing error
   */
  getCurrentUser: protectedProcedure()
    .use(loggingMiddleware("Get current user"))
    .query(({ ctx }) =>
      authService.getCurrentUser(db, fromNodeHeaders(ctx.req.headers))
    ),

  /**
   * Sign in a user
   */
  signin: publicProcedure
    .use(loggingMiddleware("User signin"))
    .input(
      z.object({
        email: z.email(),
        password: z.string(),
        rememberMe: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await authService.signin(
        db,
        fromNodeHeaders(ctx.req.headers),
        input
      );

      // Forward Set-Cookie headers from Better Auth to the client
      const setCookieHeader = result.headers.get("set-cookie");
      if (setCookieHeader) {
        ctx.res.setHeader("set-cookie", setCookieHeader);
      }

      return {
        success: result.success,
        user: result.user,
        message: result.message,
      };
    }),

  /**
   * Sign out the current user
   */
  signout: protectedProcedure()
    .use(loggingMiddleware("User signout"))
    .mutation(async ({ ctx }) => {
      const result = await authService.signout(
        db,
        fromNodeHeaders(ctx.req.headers)
      );

      // Forward Set-Cookie headers from Better Auth to the client
      const setCookieHeader = result.headers.get("set-cookie");
      if (setCookieHeader) {
        ctx.res.setHeader("set-cookie", setCookieHeader);
      }

      return {
        success: result.success,
        message: result.message,
      };
    }),
});
