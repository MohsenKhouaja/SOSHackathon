import { auth } from "@repo/auth";
import type { DBContext } from "@repo/db";
import { logger } from "@repo/logger";
import type { AuthenticatedUser, Session } from "@repo/shared";
import type { SignupInput } from "@repo/validators";
import { TRPCError } from "@trpc/server";
/**
 * Sign up a new user
 * @param _db - Database context (unused but kept for consistent service signature)
 */
export const signup = async (
  _db: DBContext,
  headers: Headers,
  input: SignupInput
) => {
  try {
    // Create user account using Better Auth API (allows setting role)
    const signupResult = await auth.api.createUser({
      body: {
        email: input.email,
        password: input.password,
        name: input.name,
        role: "admin",
      },
    });

    const userId = signupResult.user.id;
    logger.info(`Created user account: ${userId}`);

    // Sign in the user to create a session
    const signinResponse = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
      },
      headers,
      asResponse: true,
    });

    if (!signinResponse.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sign in after signup",
      });
    }

    const signinResult = (await signinResponse.json()) as {
      user: AuthenticatedUser;
    };

    if (!signinResult?.user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to sign in after signup",
      });
    }

    logger.info(`User signed in: ${userId}`);

    return {
      success: true,
      user: signinResult.user,
      message: "Account created successfully",
      headers: signinResponse.headers, // Return headers so router can set cookies
    };
  } catch (error) {
    logger.error("Signup failed:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message:
        error instanceof Error ? error.message : "Failed to create account",
    });
  }
};

/**
 * Get current authenticated user with session and organization context
 * @param db - Database context to fetch delivery company or business info
 */
export const getCurrentUser = async (db: DBContext, headers: Headers) => {
  try {
    // Get the session using Better Auth API
    const sessionData = await auth.api.getSession({
      headers,
    });

    if (!sessionData?.user) {
      return null;
    }

    const user = sessionData.user;

    // Query organization only if user has one
    let userOrganization: Awaited<
      ReturnType<typeof db.query.organization.findFirst>
    > | null = null;
    if (user.organizationId) {
      userOrganization = await db.query.organization.findFirst({
        where: {
          id: user.organizationId,
        },
      });
    }

    return {
      user: {
        ...user,
        organization: userOrganization,
      },
      session: sessionData.session as Session,
    };
  } catch (error) {
    logger.error("Failed to fetch current user:", error);
    return null;
  }
};

/**
 * Sign in a user
 * @param _db - Database context (unused - active organization is set automatically via database hooks)
 */
export const signin = async (
  _db: DBContext,
  headers: Headers,
  input: { email: string; password: string; rememberMe?: boolean }
) => {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
        rememberMe: input.rememberMe,
      },
      headers,
      asResponse: true, // Get the full response with headers
    });

    if (!response.ok) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    const result = (await response.json()) as { user: AuthenticatedUser };

    if (!result?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid credentials",
      });
    }

    logger.info(`User signed in: ${result.user.id}`);

    // Note: Active organization is automatically set via database hooks in auth.ts
    // See auth.ts -> databaseHooks.session.create.before

    return {
      success: true,
      user: result.user,
      message: "Signed in successfully",
      headers: response.headers, // Return headers so router can set cookies
    };
  } catch (error) {
    logger.error("Signin failed:", error);

    if (error instanceof TRPCError) {
      throw error;
    }

    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid credentials",
    });
  }
};

/**
 * Sign out the current user
 * @param _db - Database context (unused but kept for consistent service signature)
 */
export const signout = async (_db: DBContext, headers: Headers) => {
  try {
    const response = await auth.api.signOut({
      headers,
      asResponse: true, // Get the full response with headers
    });

    logger.info("User signed out");

    return {
      success: true,
      message: "Signed out successfully",
      headers: response.headers, // Return headers so router can set cookies
    };
  } catch (error) {
    logger.error("Signout failed:", error);

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to sign out",
    });
  }
};

export const authService = {
  signup,
  getCurrentUser,
  signin,
  signout,
};
