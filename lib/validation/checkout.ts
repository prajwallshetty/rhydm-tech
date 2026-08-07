import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter the recipient's name."),
  line1: z.string().trim().min(3, "Please enter a street address."),
  line2: z.string().trim().optional().or(z.literal("")),
  city: z.string().trim().min(2, "Please enter a city."),
  region: z.string().trim().min(2, "Please enter a state or region."),
  postalCode: z.string().trim().min(3, "Please enter a postal code."),
  country: z.string().trim().min(2).default("Germany"),
});

export const checkoutSchema = z.object({
  email: z.email("Please enter a valid email address."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  shipping: addressSchema,
  delivery: z.enum(["standard", "express"]),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  /** Only slugs and quantities — prices are resolved server-side. */
  lines: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(99),
        tradeIn: z.object({
          deviceType: z.string(),
          brand: z.string(),
          model: z.string(),
          customModel: z.boolean(),
          configRam: z.string(),
          configStorage: z.string(),
          configCpu: z.string(),
          configGpu: z.string().optional().nullable(),
          configGeneration: z.string().optional().nullable(),
          serialNumber: z.string().optional().nullable(),
          serviceTag: z.string().optional().nullable(),
          purchaseYear: z.number(),
          condition: z.string(),
          checklist: z.any(),
          images: z.array(z.string()),
          description: z.string().optional().nullable(),
          estimatedValueCents: z.number(),
        }).optional().nullable(),
      }),
    )
    .min(1, "Your cart is empty."),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
