import type { z } from "zod";
import { userAuthSchema } from "./user";

export const signupSchema = userAuthSchema
  .omit({ organizationId: true })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;
