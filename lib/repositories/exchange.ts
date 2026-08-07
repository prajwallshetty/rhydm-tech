import { db } from "@/lib/db";
import { Division } from "@/lib/generated/prisma/enums";
import { DEFAULT_EXCHANGE_RULES, ExchangeRules, calculateValuation } from "@/lib/services/valuation";
import { Prisma } from "@/lib/generated/prisma/client";

/**
 * Loads exchange rules from PageSection with key "exchange.rules".
 * Falls back to default rules if not found.
 */
export async function getExchangeRules(): Promise<ExchangeRules> {
  try {
    const section = await db.pageSection.findUnique({
      where: { key: "exchange.rules" },
    });
    if (!section) return DEFAULT_EXCHANGE_RULES;

    const content = section.content as any;
    return {
      acceptedBrands: content.acceptedBrands || DEFAULT_EXCHANGE_RULES.acceptedBrands,
      acceptedCategories: content.acceptedCategories || DEFAULT_EXCHANGE_RULES.acceptedCategories,
      depreciationPercent: typeof content.depreciationPercent === "number" ? content.depreciationPercent : DEFAULT_EXCHANGE_RULES.depreciationPercent,
      maxExchangeValueCents: typeof content.maxExchangeValueCents === "number" ? content.maxExchangeValueCents : DEFAULT_EXCHANGE_RULES.maxExchangeValueCents,
      conditionMultipliers: content.conditionMultipliers || DEFAULT_EXCHANGE_RULES.conditionMultipliers,
      pickupChargesCents: typeof content.pickupChargesCents === "number" ? content.pickupChargesCents : DEFAULT_EXCHANGE_RULES.pickupChargesCents,
      baseCategoryPricesCents: content.baseCategoryPricesCents || DEFAULT_EXCHANGE_RULES.baseCategoryPricesCents,
    };
  } catch (error) {
    console.error("Failed to load exchange rules:", error);
    return DEFAULT_EXCHANGE_RULES;
  }
}

/**
 * Saves/updates exchange rules in PageSection with key "exchange.rules".
 */
export async function updateExchangeRules(rules: Partial<ExchangeRules>) {
  const current = await getExchangeRules();
  const updated = { ...current, ...rules };

  return db.pageSection.upsert({
    where: { key: "exchange.rules" },
    update: { content: updated as any, division: Division.REFURBISHED },
    create: {
      key: "exchange.rules",
      division: Division.REFURBISHED,
      content: updated as any,
    },
  });
}

/**
 * Retrieves a single exchange request by its ID, including product and audit trail.
 */
export async function getExchangeRequestById(id: string) {
  return db.exchangeRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          priceCents: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
        },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Retrieves a single exchange request by its unique reference number.
 */
export async function getExchangeRequestByRef(referenceNumber: string) {
  return db.exchangeRequest.findUnique({
    where: { referenceNumber },
    include: {
      user: true,
      product: true,
      order: true,
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Retrieves exchange requests associated with a specific user.
 */
export async function getExchangeRequestsByUserId(userId: string) {
  return db.exchangeRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Retrieves all exchange requests for administrators, support filters.
 */
export async function getAllExchangeRequests(filters?: {
  status?: string;
  userId?: string;
}) {
  const where: any = {};
  if (filters?.status) where.status = filters.status;
  if (filters?.userId) where.userId = filters.userId;

  return db.exchangeRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Generates a unique reference number for trade-in requests, e.g. EXCH-109273
 */
function generateExchangeReference() {
  const random = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  return `EXCH-${random}`;
}

/**
 * Creates a new exchange request in the database and logs the creation activity.
 */
export async function createExchangeRequestInDb(data: {
  userId?: string | null;
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
  estimatedValueCents: number;
}) {
  const referenceNumber = generateExchangeReference();

  // Create request and starting activity in a transaction
  return db.$transaction(async (tx) => {
    const request = await tx.exchangeRequest.create({
      data: {
        referenceNumber,
        userId: data.userId || null,
        productId: data.productId || null,
        deviceType: data.deviceType,
        brand: data.brand,
        model: data.model,
        customModel: data.customModel || false,
        configRam: data.configRam,
        configStorage: data.configStorage,
        configCpu: data.configCpu,
        configGpu: data.configGpu || null,
        configGeneration: data.configGeneration || null,
        serialNumber: data.serialNumber || null,
        serviceTag: data.serviceTag || null,
        purchaseYear: data.purchaseYear || null,
        condition: data.condition,
        checklist: data.checklist,
        images: data.images,
        description: data.description || null,
        estimatedValueCents: data.estimatedValueCents,
        status: "PENDING",
      },
    });

    await tx.exchangeActivity.create({
      data: {
        exchangeRequestId: request.id,
        userId: data.userId || null,
        action: "REQUEST_CREATED",
        toStatus: "PENDING",
        details: "Exchange request submitted.",
      },
    });

    return request;
  });
}

/**
 * Updates status of an exchange request, registers the update in the audit trail.
 */
export async function updateExchangeStatusInDb(
  id: string,
  newStatus: string,
  options: {
    userId?: string | null;
    action?: string;
    details?: string;
    finalValueCents?: number;
    notes?: string;
    pickupOption?: string;
    pickupSchedule?: any;
    images?: string[];
  }
) {
  return db.$transaction(async (tx) => {
    const request = await tx.exchangeRequest.findUnique({
      where: { id },
      select: { status: true, images: true },
    });

    if (!request) throw new Error("Exchange request not found.");

    const updateData: any = {
      status: newStatus,
    };

    if (options.finalValueCents !== undefined) {
      updateData.finalValueCents = options.finalValueCents;
    }
    if (options.notes !== undefined) {
      updateData.notes = options.notes;
    }
    if (options.pickupOption !== undefined) {
      updateData.pickupOption = options.pickupOption;
    }
    if (options.pickupSchedule !== undefined) {
      updateData.pickupSchedule = options.pickupSchedule;
    }
    if (options.images !== undefined) {
      // Append or replace images
      updateData.images = [...request.images, ...options.images];
    }

    const updated = await tx.exchangeRequest.update({
      where: { id },
      data: updateData,
    });

    await tx.exchangeActivity.create({
      data: {
        exchangeRequestId: id,
        userId: options.userId || null,
        action: options.action || "STATUS_UPDATED",
        fromStatus: request.status,
        toStatus: newStatus,
        details: options.details || `Status updated from ${request.status} to ${newStatus}.`,
      },
    });

    return updated;
  });
}
