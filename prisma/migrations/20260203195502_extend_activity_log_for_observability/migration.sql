-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "latencyMs" DOUBLE PRECISION,
ADD COLUMN     "meta" TEXT,
ADD COLUMN     "method" TEXT,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "url" TEXT;
