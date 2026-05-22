import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './jwt-auth.guard';

/**
 * RolesGuard middleware creator.
 * Can be used in two ways:
 * 1. RolesGuard(ControllerClass.method) -> inspects metadata added by the @Roles() decorator
 * 2. RolesGuard('ADMIN', 'EMPLOYER') -> sets required roles directly in the route declaration
 */
export const RolesGuard = (handlerOrRole: any, ...extraRoles: ('LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' | 'ADMIN')[]) => {
  if (typeof handlerOrRole === 'function') {
    const requiredRoles = handlerOrRole.roles;
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!requiredRoles || requiredRoles.length === 0) {
        return next();
      }

      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Unauthorized: User not authenticated',
        });
      }

      if (!requiredRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: Insufficient permissions',
        });
      }

      return next();
    };
  }

  const requiredRoles = typeof handlerOrRole === 'string' ? [handlerOrRole, ...extraRoles] : handlerOrRole;
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!requiredRoles || requiredRoles.length === 0) {
      return next();
    }

    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User not authenticated',
      });
    }

    if (!requiredRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Forbidden: Insufficient permissions',
      });
    }

    return next();
  };
};
