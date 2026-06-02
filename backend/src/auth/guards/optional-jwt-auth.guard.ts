import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Attaches req.user when Bearer token is valid; does not block guests. */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers?.authorization as string | undefined;

    if (!authHeader?.startsWith('Bearer ')) {
      return true;
    }

    return super.canActivate(context) as Promise<boolean>;
  }

  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err || !user) {
      return null as TUser;
    }
    return user;
  }
}
