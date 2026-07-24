-- Admin panel enhancements: category imagery, review moderation, coupon
-- scoping/usage, testimonial featured flag, and a stock-movement ledger.
-- All changes are additive. Existing reviews are backfilled to APPROVED so
-- nothing disappears from the storefront; new reviews default to PENDING.

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable: Category imagery
ALTER TABLE "Category" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "iconUrl" TEXT;

-- AlterTable: Review moderation status (existing rows -> APPROVED, future -> PENDING)
ALTER TABLE "Review" ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable: Testimonial featured flag
ALTER TABLE "Testimonial" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: Coupon scoping and usage
ALTER TABLE "Coupon" ADD COLUMN     "usageLimit" INTEGER,
ADD COLUMN     "usageCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "oncePerCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "redeemedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "categoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable: StockMovement ledger
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "StockMovement_productId_createdAt_idx" ON "StockMovement"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
