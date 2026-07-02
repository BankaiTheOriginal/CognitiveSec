import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from 'generated/prisma/enums';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
