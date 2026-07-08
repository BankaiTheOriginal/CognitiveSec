import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.activeOrganizationId || !payload.role) {
      throw new UnauthorizedException(
        'Invalid token context metadata configurations',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.activeOrganizationId,
      role: payload.role,
    };
  }
}
