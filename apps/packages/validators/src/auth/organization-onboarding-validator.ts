import { z } from "zod";

export const organizationOnboardingSchema = z.object({
  // Organization details
  organizationName: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(100, "Organization name must be less than 100 characters"),
  organizationSlug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    )
    .optional(),

  // Delivery company specific fields
  companyDescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .optional(),

  businessLicense: z
    .string()
    .min(5, "Business license must be at least 5 characters")
    .optional(),

  taxId: z.string().min(5, "Tax ID must be at least 5 characters").optional(),

  // Address information
  streetAddress: z
    .string()
    .min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),

  // Contact information
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .regex(/^\+?[\d\s\-()]+$/, "Please enter a valid phone number"),

  website: z
    .string()
    .url("Please enter a valid website URL")
    .optional()
    .or(z.literal("")),

  // Service areas and capabilities
  serviceAreas: z
    .array(z.string())
    .min(1, "Please select at least one service area")
    .optional(),

  vehicleTypes: z
    .array(z.string())
    .min(1, "Please select at least one vehicle type")
    .optional(),

  maxDeliveryRadius: z
    .number()
    .min(1, "Delivery radius must be at least 1 km")
    .max(1000, "Delivery radius cannot exceed 1000 km")
    .optional(),

  // Business hours
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

export type OrganizationOnboardingInput = z.infer<
  typeof organizationOnboardingSchema
>;
