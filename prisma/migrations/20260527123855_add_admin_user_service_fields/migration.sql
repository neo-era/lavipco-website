-- AlterTable
ALTER TABLE "services" ADD COLUMN     "processSteps" JSONB,
ADD COLUMN     "shortDescription" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "isLocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
