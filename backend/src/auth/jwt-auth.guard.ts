import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
export { AuthenticatedRequest };

export const JwtAuthGuard = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: info && info.message ? `Unauthorized: ${info.message}` : 'Unauthorized: Invalid or expired token',
      });
    }
    (req as AuthenticatedRequest).user = user;
    return next();
  })(req, res, next);
};
