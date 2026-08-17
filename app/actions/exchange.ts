"use server";

import { z } from "zod";

import { getSession } from "@/lib/auth/session";
import { isCloudinaryConfigured, signUpload } from "@/lib/media/cloudinary";
import { createExchangeRequestInDb } from "@/lib/repositories/exchange";
import { notifyAdminNewRequest } from "@/lib/services/notifications";

/**
 * Signs a Cloudinary upload request for exchange device images.
 * Open to any storefront user (guests & logged-in customers).
 */
export async function signExchangeUploadAction() {
  if (!isCloudinaryConfigured()) {
    return { error: "Cloudinary is not configured on the server." };
  }
  // Store all exchange uploads in the 'rhydm/exchanges' Cloudinary folder
  return { upload: signUpload("rhydm/exchanges") };
}

/**
 * Shape accepted from the exchange wizard.
 *
 * Validated server-side because the wizard is a public surface — guests submit
 * without a session, so nothing upstream has already checked these values.
 * Free-text fields are length-capped to keep a scripted submission from
 * writing unbounded data, and `images` only accepts URLs on our own media
 * host so the admin panel can never be pointed at an arbitrary remote image.
 */
const CLOUDINARY_IMAGE = /^https:\/\/res\.cloudinary\.com\/[\w.-]+\/image\/upload\//;

const submitSchema = z.object({
  productId: z.string().max(64).nullish(),
  deviceType: z.string().min(1).max(60),
  brand: z.string().min(1).max(60),
  model: z.string().min(1).max(120),
  customModel: z.boolean().optional(),
  configRam: z.string().max(60),
  configStorage: z.string().max(60),
  configCpu: z.string().max(60),
  configGpu: z.string().max(120).nullish(),
  configGeneration: z.string().max(60).nullish(),
  serialNumber: z.string().max(120).nullish(),
  serviceTag: z.string().max(120).nullish(),
  purchaseYear: z.number().int().min(1990).max(new Date().getFullYear()).nullish(),
  condition: z.string().min(1).max(40),
  checklist: z.record(z.string(), z.boolean()).default({}),
  images: z.array(z.string().url().regex(CLOUDINARY_IMAGE)).min(1).max(10),
  description: z.string().max(4000).nullish(),

  contactName: z.string().min(2, "Please enter your name.").max(120),
  contactEmail: z.email("Please enter a valid email address.").max(190),
  contactPhone: z.string().min(5, "Please enter a phone number.").max(40),
  pickupOption: z.enum(["Pickup", "Drop-off", "Courier"]).nullish(),
  pickupAddress: z.string().max(500).nullish(),
});

export type SubmitExchangeInput = z.input<typeof submitSchema>;

/**
 * Submits an exchange request for manual review.
 *
 * Deliberately returns **no valuation**: Rhydm prices every trade-in by hand
 * after inspecting the device details and photos, so the customer receives a
 * reference number and a promise of contact, never an automatic number.
 */
export async function submitExchangeRequestAction(payload: SubmitExchangeInput) {
  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      success: false as const,
      error:
        parsed.error.issues[0]?.message ??
        "Some of the details were incomplete. Please review the form and try again.",
    };
  }
  const data = parsed.data;

  const session = await getSession();

  try {
    const request = await createExchangeRequestInDb({
      ...data,
      userId: session?.id ?? null,
      pickupSchedule: data.pickupAddress ? { address: data.pickupAddress } : null,
    });

    // Best-effort: a failed admin notification must not lose the request the
    // customer just submitted.
    try {
      await notifyAdminNewRequest(request.referenceNumber, `${data.brand} ${data.model}`);
    } catch (error) {
      console.error("Exchange admin notification failed", error);
    }

    return {
      success: true as const,
      exchangeId: request.id,
      referenceNumber: request.referenceNumber,
    };
  } catch (error) {
    console.error("Exchange request submission failed", error);
    return {
      success: false as const,
      error: "We could not submit your request just now. Please try again.",
    };
  }
}

export async function customerRespondToCounterAction(id: string, accept: boolean) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");

  const { updateExchangeStatusInDb, getExchangeRequestById } = await import("@/lib/repositories/exchange");
  const request = await getExchangeRequestById(id);
  if (!request || request.userId !== session.id) {
    throw new Error("Exchange request not found.");
  }

  const nextStatus = accept ? "APPROVED" : "REJECTED";
  const action = accept ? "COUNTER_ACCEPTED" : "COUNTER_REJECTED";
  const details = accept 
    ? `Customer accepted the counter offer of €${((request.finalValueCents ?? 0)/100).toFixed(2)}.`
    : "Customer rejected the counter offer.";

  const updated = await updateExchangeStatusInDb(id, nextStatus, {
    userId: session.id,
    action,
    details,
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/refurbished/account");
  revalidatePath(`/admin/exchanges/${id}`);
  return { success: true, updated };
}

export async function customerAddImagesAction(id: string, newImages: string[]) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");

  const { updateExchangeStatusInDb, getExchangeRequestById } = await import("@/lib/repositories/exchange");
  const request = await getExchangeRequestById(id);
  if (!request || request.userId !== session.id) {
    throw new Error("Exchange request not found.");
  }

  const updated = await updateExchangeStatusInDb(id, request.status, {
    userId: session.id,
    action: "IMAGES_ADDED",
    details: `Customer uploaded ${newImages.length} additional images.`,
    images: newImages,
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/refurbished/account");
  revalidatePath(`/admin/exchanges/${id}`);
  return { success: true, updated };
}

export async function customerSchedulePickupAction(
  id: string,
  pickupOption: string,
  schedule: {
    address?: string;
    date?: string;
    timeSlot?: string;
    instructions?: string;
  }
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized.");

  const { updateExchangeStatusInDb, getExchangeRequestById } = await import("@/lib/repositories/exchange");
  const request = await getExchangeRequestById(id);
  if (!request || request.userId !== session.id) {
    throw new Error("Exchange request not found.");
  }

  const updated = await updateExchangeStatusInDb(id, "PICKUP_SCHEDULED", {
    userId: session.id,
    action: "PICKUP_SCHEDULED",
    details: `Customer scheduled pickup option: ${pickupOption}. Date: ${schedule.date || "N/A"}`,
    pickupOption,
    pickupSchedule: schedule,
  });

  const { revalidatePath } = await import("next/cache");
  revalidatePath("/refurbished/account");
  revalidatePath(`/admin/exchanges/${id}`);
  return { success: true, updated };
}
