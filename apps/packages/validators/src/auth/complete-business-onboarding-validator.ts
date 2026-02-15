import { z } from "zod";
import { businessOnboardingSchema } from "./business-onboarding-validator";
import { signupSchema } from "./signup-validator";

export const completeBusinessOnboardingSchema = z.object({
  signup: signupSchema,
  business: businessOnboardingSchema,
});

export type CompleteBusinessOnboardingInput = z.infer<
  typeof completeBusinessOnboardingSchema
>;
