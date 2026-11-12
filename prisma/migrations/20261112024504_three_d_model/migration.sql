-- CreateTable
CREATE TABLE "ThreeDModel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resultUrl" TEXT,
    "taskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThreeDModel_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThreeDModel" ADD CONSTRAINT "ThreeDModel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

