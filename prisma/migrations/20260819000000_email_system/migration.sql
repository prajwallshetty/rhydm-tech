-- Email system: Gmail-backed transactional + marketing mail.
--
-- Strictly additive. Every new column is nullable or carries a default, so
-- rows written by the previous build stay valid and a rollback to it keeps
-- working. No column is dropped and no data is rewritten.

-- Enums -----------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "EmailType" AS ENUM (
    'ORDER_CONFIRMATION', 'PASSWORD_RESET', 'EXCHANGE_RECEIVED',
    'EXCHANGE_ADMIN_NOTIFICATION', 'CONTACT_NOTIFICATION',
    'CONTACT_ACKNOWLEDGEMENT', 'ADMIN_NOTIFICATION', 'MARKETING', 'TEST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENDING', 'SENT', 'FAILED', 'BOUNCED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignStatus" AS ENUM (
    'DRAFT', 'QUEUED', 'SENDING', 'SENT', 'PARTIAL', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignAudience" AS ENUM (
    'ALL_OPTED_IN', 'NEWSLETTER_SUBSCRIBERS', 'CUSTOMERS_WITH_ORDERS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Existing tables: additive columns -------------------------------------------
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "marketingConsent"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "marketingConsentAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "unsubscribeToken"   TEXT;

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "confirmationEmailSentAt" TIMESTAMP(3);

ALTER TABLE "ContactSubmission"
  ADD COLUMN IF NOT EXISTS "notificationSentAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "User_unsubscribeToken_key" ON "User"("unsubscribeToken");
CREATE INDEX IF NOT EXISTS "User_marketingConsent_idx" ON "User"("marketingConsent");
CREATE INDEX IF NOT EXISTS "ContactSubmission_email_createdAt_idx" ON "ContactSubmission"("email", "createdAt");

-- New tables ------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "EmailCampaign" (
  "id"              TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "subject"         TEXT NOT NULL,
  "previewText"     TEXT,
  "bodyHtml"        TEXT NOT NULL,
  "bodyText"        TEXT,
  "audience"        "CampaignAudience" NOT NULL DEFAULT 'ALL_OPTED_IN',
  "productIds"      TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status"          "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "totalRecipients" INTEGER NOT NULL DEFAULT 0,
  "sentCount"       INTEGER NOT NULL DEFAULT 0,
  "failedCount"     INTEGER NOT NULL DEFAULT 0,
  "createdById"     TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL,
  "scheduledAt"     TIMESTAMP(3),
  "startedAt"       TIMESTAMP(3),
  "completedAt"     TIMESTAMP(3),
  CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EmailCampaign_status_createdAt_idx" ON "EmailCampaign"("status", "createdAt");

CREATE TABLE IF NOT EXISTS "EmailLog" (
  "id"         TEXT NOT NULL,
  "recipient"  TEXT NOT NULL,
  "type"       "EmailType" NOT NULL,
  "subject"    TEXT NOT NULL,
  "status"     "EmailStatus" NOT NULL DEFAULT 'QUEUED',
  "messageId"  TEXT,
  "error"      TEXT,
  "attempts"   INTEGER NOT NULL DEFAULT 0,
  "userId"     TEXT,
  "orderId"    TEXT,
  "campaignId" TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt"     TIMESTAMP(3),
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "EmailLog_recipient_idx"    ON "EmailLog"("recipient");
CREATE INDEX IF NOT EXISTS "EmailLog_type_status_idx"  ON "EmailLog"("type", "status");
CREATE INDEX IF NOT EXISTS "EmailLog_orderId_idx"      ON "EmailLog"("orderId");
CREATE INDEX IF NOT EXISTS "EmailLog_campaignId_idx"   ON "EmailLog"("campaignId");
CREATE INDEX IF NOT EXISTS "EmailLog_createdAt_idx"    ON "EmailLog"("createdAt");

CREATE TABLE IF NOT EXISTS "CampaignRecipient" (
  "id"         TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "email"      TEXT NOT NULL,
  "name"       TEXT,
  "userId"     TEXT,
  "status"     "EmailStatus" NOT NULL DEFAULT 'QUEUED',
  "error"      TEXT,
  "attempts"   INTEGER NOT NULL DEFAULT 0,
  "sentAt"     TIMESTAMP(3),
  "claimedAt"  TIMESTAMP(3),
  CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "CampaignRecipient_campaignId_email_key" ON "CampaignRecipient"("campaignId", "email");
CREATE INDEX IF NOT EXISTS "CampaignRecipient_campaignId_status_idx" ON "CampaignRecipient"("campaignId", "status");

CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
  "id"               TEXT NOT NULL,
  "email"            TEXT NOT NULL,
  "name"             TEXT,
  "consent"          BOOLEAN NOT NULL DEFAULT true,
  "unsubscribeToken" TEXT NOT NULL,
  "source"           TEXT,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "unsubscribedAt"   TIMESTAMP(3),
  CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");
CREATE INDEX IF NOT EXISTS "NewsletterSubscriber_consent_idx" ON "NewsletterSubscriber"("consent");

-- Foreign keys ----------------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey"
    FOREIGN KEY ("campaignId") REFERENCES "EmailCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Encrypted Gmail refresh-token store (see model docs for why it is not a URL).
CREATE TABLE IF NOT EXISTS "EmailCredential" (
  "id"            TEXT NOT NULL,
  "ciphertext"    TEXT NOT NULL,
  "iv"            TEXT NOT NULL,
  "authTag"       TEXT NOT NULL,
  "senderEmail"   TEXT NOT NULL,
  "scope"         TEXT,
  "connectedById" TEXT,
  "connectedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmailCredential_pkey" PRIMARY KEY ("id")
);
