-- Exchange: customer contact details + manual (admin-entered) offer tracking.
--
-- Every column added here is nullable and every existing column keeps its
-- data, so this migration is safe to apply to a live database and older
-- application builds continue to work against the migrated schema.

-- Contact details for the customer who submitted the request. Guest
-- submissions previously carried no way to reach the customer at all.
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;

-- Manual offer bookkeeping. The offer amount itself continues to live in the
-- pre-existing "finalValueCents" column.
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "offerMethod" TEXT;
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "offerNotes" TEXT;
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "offerSentAt" TIMESTAMP(3);
ALTER TABLE "ExchangeRequest" ADD COLUMN IF NOT EXISTS "customerContactedAt" TIMESTAMP(3);

-- The customer-facing flow no longer computes an automatic valuation, so the
-- application stops writing this column. Existing rows keep their historical
-- value; new rows default to 0. Defaulting (rather than dropping the column)
-- keeps the change reversible and non-destructive.
ALTER TABLE "ExchangeRequest" ALTER COLUMN "estimatedValueCents" SET DEFAULT 0;
