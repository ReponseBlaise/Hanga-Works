import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

// 1. Get all jobs (with optional filters)
export const getJobs = async (req: Request, res: Response) => {
  const { search, location } = req.query;

  try {
    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    if (location) {
      whereClause.location = { contains: String(location), mode: 'insensitive' };
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            website: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { postedAt: 'desc' },
    });

    return res.json({
      status: 'success',
      data: { jobs },
    });
  } catch (error: any) {
    console.error('Get Jobs Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve jobs',
      error: error.message,
    });
  }
};

// 2. Get a job by ID
export const getJobById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsedId = Number(id);

  if (isNaN(parsedId)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid job ID format',
    });
  }

  try {
    const job = await prisma.job.findUnique({
      where: { id: parsedId },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            website: true,
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job listing not found',
      });
    }

    return res.json({
      status: 'success',
      data: { job },
    });
  } catch (error: any) {
    console.error('Get Job by ID Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve job details',
      error: error.message,
    });
  }
};

// 3. Create a Job posting (Employer or Admin only)
export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, location, jobType, salaryMin, salaryMax } = req.body;

  try {
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    if (!req.user.organizationId) {
      return res.status(400).json({
        status: 'error',
        message: 'Your account must be linked to an Organization/Employer profile to post a job.',
      });
    }

    if (!title || !description) {
      return res.status(400).json({
        status: 'error',
        message: 'Title and description are required',
      });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        description,
        location,
        jobType,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        employerId: req.user.organizationId,
      },
    });

    return res.status(201).json({
      status: 'success',
      data: { job },
    });
  } catch (error: any) {
    console.error('Create Job Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to post job listing',
      error: error.message,
    });
  }
};
