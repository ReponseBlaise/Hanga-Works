-- Track where learners left off in a course
ALTER TABLE "Enrollment" ADD COLUMN IF NOT EXISTS "lastModuleId" TEXT;

CREATE INDEX IF NOT EXISTS "Enrollment_lastModuleId_idx" ON "Enrollment"("lastModuleId");

DO $$ BEGIN
  ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_lastModuleId_fkey" FOREIGN KEY ("lastModuleId") REFERENCES "CourseModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
