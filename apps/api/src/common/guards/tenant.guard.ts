// src/common/guards/tenant.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organizationId) {
      throw new ForbiddenException('Tenant context missing or unauthenticated');
    }

    const routeOrgId = request.params.orgId || request.query.orgId;

    if (routeOrgId && routeOrgId !== user.organizationId) {
      throw new ForbiddenException(
        'Cross-tenant data access violation detected',
      );
    }

    request.tenantId = user.organizationId;
    return true;
  }
}
