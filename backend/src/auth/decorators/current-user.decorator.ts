import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserPayload {
  userId: string;
  email: string;
  role: string;
}

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  if (!req.user) {
    return null;
  }
  return {
    ...req.user,
    userId: req.user?.id || req.user?.userId,
    email: req.user?.email,
    role: req.user?.role,
  } as CurrentUserPayload;
});