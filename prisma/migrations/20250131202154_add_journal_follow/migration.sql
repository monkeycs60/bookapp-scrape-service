-- CreateTable
CREATE TABLE "JournalFollow" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalFollow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalFollow_source_idx" ON "JournalFollow"("source");

-- CreateIndex
CREATE UNIQUE INDEX "JournalFollow_userId_source_key" ON "JournalFollow"("userId", "source");

-- AddForeignKey
ALTER TABLE "JournalFollow" ADD CONSTRAINT "JournalFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
