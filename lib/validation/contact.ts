import { z } from "zod";

/**
 * Shared by the client form and the server action, so validation cannot drift
 * between them. The server re-validates regardless — client-side checks are a
 * UX affordance, never a trust boundary.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.email("Please enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(40, "That phone number looks too long.")
    .optional()
    .or(z.literal("")),
  company: z
    .string()
    .trim()
    .max(120, "That company name looks too long.")
    .optional()
    .or(z.literal("")),
  topic: z.enum(["pickup", "consultation", "quote", "other"]),
  message: z
    .string()
    .trim()
    .min(20, "Please give us a little more detail (at least 20 characters).")
    .max(4000, "Please keep this under 4000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const TOPIC_OPTIONS: { value: ContactInput["topic"]; label: string }[] = [
  { value: "pickup", label: "Request a pickup" },
  { value: "consultation", label: "Schedule a consultation" },
  { value: "quote", label: "Request a quote" },
  { value: "other", label: "Something else" },
];
