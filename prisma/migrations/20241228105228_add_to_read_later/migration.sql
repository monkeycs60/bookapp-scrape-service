-- CreateTable
CREATE TABLE "UserToReadLater" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserToReadLater_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserReadingHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserReadingHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserToReadLater_userId_articleId_key" ON "UserToReadLater"("userId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserReadingHistory_userId_articleId_key" ON "UserReadingHistory"("userId", "articleId");

-- AddForeignKey
ALTER TABLE "UserToReadLater" ADD CONSTRAINT "UserToReadLater_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToReadLater" ADD CONSTRAINT "UserToReadLater_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReadingHistory" ADD CONSTRAINT "UserReadingHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserReadingHistory" ADD CONSTRAINT "UserReadingHistory_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
