import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

type HttpAuditRequest = {
  method: string;
  url: string;
  body?: unknown;
  user?: { userId?: string };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpAuditRequest>();
    const method = request.method;
    const url = request.url;

    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const user = request.user;
      
      return next.handle().pipe(
        tap(() => {
          this.prisma.auditLog.create({
            data: {
              actorId: user?.userId || null,
              action: `${method} ${url}`,
              meta: JSON.stringify(request.body || {}).substring(0, 500),
            },
          }).catch((err: unknown) => console.error('Failed to write audit log', err));
        }),
      );
    }

    return next.handle();
  }
}
