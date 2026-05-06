import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedStaff } from '../../auth/auth.types';

export const CurrentStaff = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedStaff => {
    const request = context
      .switchToHttp()
      .getRequest<{ user: AuthenticatedStaff }>();
    return request.user;
  },
);
