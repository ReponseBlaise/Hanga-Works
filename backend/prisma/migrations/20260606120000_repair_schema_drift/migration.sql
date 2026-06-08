-- Idempotent repair for databases where 20260605111644_init was marked applied but not executed.

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "AccountStatus" ADD VALUE IF NOT EXISTS 'PENDING';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'RWF';
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "isPremium" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "price" DOUBLE PRECISION DEFAULT 0;

ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "companyCertificate" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "trainingCertificate" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "headline" TEXT;

CREATE TABLE IF NOT EXISTS "CourseTest" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "instructions" TEXT,
    "passingScore" INTEGER NOT NULL DEFAULT 80,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CourseTest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TestQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TestOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TestOption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TestAttempt" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "txRef" TEXT NOT NULL,
    "transactionId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'RWF',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "provider" TEXT NOT NULL DEFAULT 'flutterwave',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CourseTest_courseId_key" ON "CourseTest"("courseId");
CREATE INDEX IF NOT EXISTS "TestQuestion_testId_idx" ON "TestQuestion"("testId");
CREATE INDEX IF NOT EXISTS "TestOption_questionId_idx" ON "TestOption"("questionId");
CREATE INDEX IF NOT EXISTS "TestAttempt_testId_idx" ON "TestAttempt"("testId");
CREATE INDEX IF NOT EXISTS "TestAttempt_userId_idx" ON "TestAttempt"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_txRef_key" ON "Payment"("txRef");
CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");
CREATE INDEX IF NOT EXISTS "Payment_courseId_idx" ON "Payment"("courseId");
CREATE INDEX IF NOT EXISTS "Payment_txRef_idx" ON "Payment"("txRef");
CREATE INDEX IF NOT EXISTS "Course_isPremium_idx" ON "Course"("isPremium");

DO $$ BEGIN
  ALTER TABLE "CourseTest" ADD CONSTRAINT "CourseTest_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "CourseTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TestOption" ADD CONSTRAINT "TestOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_testId_fkey" FOREIGN KEY ("testId") REFERENCES "CourseTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Payment" ADD CONSTRAINT "Payment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
