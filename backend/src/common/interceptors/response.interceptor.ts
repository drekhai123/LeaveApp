import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import {
  SuccessResponseDto,
  SuccessResponseMeta,
} from '../dto/success-response.dto';

type ResponsePayload<T> = {
  data: T;
  meta?: SuccessResponseMeta;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponseDto<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponseDto<T>> {
    const request = context.switchToHttp().getRequest<{ url: string }>();
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();

    return next.handle().pipe(
      map((rawPayload) => {
        const payload = this.normalizePayload(rawPayload);
        return {
          success: true as const,
          statusCode: response.statusCode,
          message: 'Request successful',
          timestamp: new Date().toISOString(),
          path: request.url,
          data: payload.data,
          meta: payload.meta ?? null,
        };
      }),
    );
  }

  private normalizePayload(payload: T): ResponsePayload<T> {
    if (
      typeof payload === 'object' &&
      payload !== null &&
      'data' in payload &&
      'meta' in payload
    ) {
      const normalized = payload as ResponsePayload<T>;
      return {
        data: normalized.data,
        meta: normalized.meta ?? null,
      };
    }

    return {
      data: payload,
      meta: null,
    };
  }
}
