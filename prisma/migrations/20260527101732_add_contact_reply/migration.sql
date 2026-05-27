-- CreateTable
CREATE TABLE "contact_replies" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "byUserId" TEXT,
    "body" TEXT NOT NULL,
    "sentEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_replies_messageId_createdAt_idx" ON "contact_replies"("messageId", "createdAt");

-- AddForeignKey
ALTER TABLE "contact_replies" ADD CONSTRAINT "contact_replies_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
