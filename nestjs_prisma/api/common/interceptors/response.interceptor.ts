import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const requestId = request.id || 'unknown';

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data || null,
        meta: {
          requestId,
        },
      })),
    );
  }
}
