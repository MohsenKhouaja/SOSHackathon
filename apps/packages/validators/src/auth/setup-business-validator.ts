import { z } from "zod";

/**
 * Schema for setting up a business organization after signup
 * This is used when the user is already authenticated
 */
export const setupBusinessSchema = z.object({
  // Organization details
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters"),

  // Organization fields (stored in organization table)
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"),
  website: z
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),
  streetAddress: z
    .string()
    .min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  businessLicense: z
    .string()
    .min(5, "Business license must be at least 5 characters")
    .optional(),
  taxId: z.string().min(5, "Tax ID must be at least 5 characters").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .optional(),

  // Business specific operating hours
  operatingHours: z
    .object({
      monday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
      tuesday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
      wednesday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
      thursday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
      friday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
      saturday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
      sunday: z.object({
        isOpen: z.boolean(),
        start: z.string().optional(),
        end: z.string().optional(),
      }),
    })
    .optional(),

  // Terms and agreements
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  acceptPrivacyPolicy: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

export type SetupBusinessInput = z.infer<typeof setupBusinessSchema>;
