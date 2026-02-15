import { z } from "zod";
import { organizationOnboardingSchema } from "./organization-onboarding-validator";
import { signupSchema } from "./signup-validator";

/**
 * Combined schema for the complete onboarding process
 * Includes both signup and organization setup data
 */
export const completeOnboardingSchema = z.object({
  signup: signupSchema,
  organization: organizationOnboardingSchema,
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
