import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request, Response } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { SignUp } from './dto/auth.dto';
interface Login {
  email: string;
  password: string;
}
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: Login, @Res({ passthrough: true }) res: Response) {
    const { tokens, user, role, organizationId } = await this.authService.login(
      body.email,
      body.password,
    );

    res.cookie('refreshToken', tokens.refresh_token, {
      maxAge: SEVEN_DAYS_IN_MS,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/',
    });
    const access_token = tokens.access_token;
    return { access_token, user, role, organizationId };
  }

  @Post('sign-up')
  async signUp(@Body() body: SignUp) {
    return this.authService.signUp(body);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const og_refresh_token = req.cookies['refreshToken'];

    if (!og_refresh_token)
      throw new UnauthorizedException('Refresh token missing');

    const { access_token, refresh_token } =
      await this.authService.refresh(og_refresh_token);

    res.cookie('refreshToken', refresh_token, {
      maxAge: SEVEN_DAYS_IN_MS,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/',
    });

    return access_token;
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/',
    });
  }

  @UseGuards(JwtGuard)
  @Post('switch-workspace')
  async switchWorkspace(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { targetOrganizationId: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user_context } = await this.authService.switchWorkspace(
      user.id,
      body.targetOrganizationId,
    );
    res.cookie('refreshToken', tokens.refresh_token, {
      maxAge: SEVEN_DAYS_IN_MS,
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
      path: '/',
    });
    const { access_token } = tokens;
    return { access_token, user_context };
  }

  @UseGuards(JwtGuard, TenantGuard)
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.me(user.id, user.organizationId);
  }
}
