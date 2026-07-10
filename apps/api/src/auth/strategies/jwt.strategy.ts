import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt_secret')!,
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
