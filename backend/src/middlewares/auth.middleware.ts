import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      role: 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' | 'ADMIN';
      name?: string;
      organizationId?: number | null;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'hanga_works_jwt_secret_super_secure_key_2026';

    try {
      const decoded = jwt.verify(token, secret) as {
        id: number;
        email: string;
        role: 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' | 'ADMIN';
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
          organizationId: true,
        },
      });

      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized',
        });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name ?? undefined,
        organizationId: user.organizationId,
      };
      return next();
    } catch (error) {
      return res.status(403).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }
  }

  return res.status(401).json({
    status: 'error',
    message: 'Authorization token required',
  });
};

export const requireRoles = (roles: Array<'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' | 'ADMIN'>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }

    return next();
  };
};
