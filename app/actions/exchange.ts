"use server";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { isCloudinaryConfigured, signUpload } from "@/lib/media/cloudinary";
import { calculateValuation } from "@/lib/services/valuation";
import { getExchangeRules } from "@/lib/repositories/exchange";
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

export type EstimateInput = {
  deviceType: string;
  brand: string;
  purchaseYear?: number;
  configRam?: string;
  configStorage?: string;
  configCpu?: string;
  condition: string;
  checklist?: any;
};

/**
 * Calculates estimated valuation of a device based on active rules.
 */
export async function calculateExchangeEstimateAction(specs: EstimateInput) {
  const rules = await getExchangeRules();
  const estimateCents = calculateValuation(specs, rules);
  return { estimateCents };
}

/**
 * Submits an exchange request. If the user is logged in, associates it with their account.
 */
export async function submitExchangeRequestAction(payload: {
  productId?: string | null;
  deviceType: string;
  brand: string;
  model: string;
  customModel?: boolean;
  configRam: string;
  configStorage: string;
  configCpu: string;
  configGpu?: string;
  configGeneration?: string;
  serialNumber?: string;
  serviceTag?: string;
  purchaseYear?: number;
  condition: string;
  checklist: any;
  images: string[];
  description?: string;
}) {
  const session = await getSession();
  const userId = session?.id || null;

  // Recalculate value server-side to guarantee integrity
  const rules = await getExchangeRules();
  const estimatedValueCents = calculateValuation({
    deviceType: payload.deviceType,
    brand: payload.brand,
    purchaseYear: payload.purchaseYear,
    configRam: payload.configRam,
    configStorage: payload.configStorage,
    configCpu: payload.configCpu,
    condition: payload.condition,
    checklist: payload.checklist,
  }, rules);

  const request = await createExchangeRequestInDb({
    ...payload,
    userId,
    estimatedValueCents,
  });

  // Notify admin of the new request
  await notifyAdminNewRequest(request.referenceNumber, `${payload.brand} ${payload.model}`);

  return {
    success: true,
    exchangeId: request.id,
    referenceNumber: request.referenceNumber,
    estimatedValueCents: request.estimatedValueCents,
  };
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
