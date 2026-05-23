import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['LEARNER', 'EMPLOYER', 'INSTITUTION', 'MENTOR']).optional(),
}).strict(); // strict() acts like class-validator whitelist: true

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
}).strict();

export const CreateJobSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  location: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']).optional(),
  salaryMin: z.union([z.string(), z.number()]).optional(),
  salaryMax: z.union([z.string(), z.number()]).optional(),
}).strict();

export const UpdateApplicationStageSchema = z.object({
  stage: z.enum(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED']),
}).strict();
