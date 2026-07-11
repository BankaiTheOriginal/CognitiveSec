import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { SignUp } from './dto/auth.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private encrypt(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private verifyHash(hash: string, token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hashedToken))) {
      return true;
    } else {
      return false;
    }
  }
  private async findUser(email?: string, userId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, id: userId },
      include: { memberships: true },
    });
    if (!user) throw new UnauthorizedException('Wrong email or password');
    return user;
  }
  async findUserInOrg(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { user: true },
    });
    if (!membership) throw new UnauthorizedException('Access denied');
    return membership;
  }

  private async generateTokenPair(user: any, activeMembership: any) {
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      activeOrganizationId: activeMembership.organizationId,
      role: activeMembership.role,
    };

    const refreshTokenPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwt.sign(accessTokenPayload, { expiresIn: '1h' });
    const refreshToken = this.jwt.sign(refreshTokenPayload, {
      expiresIn: '7d',
    });

    const hashedRefreshToken = this.encrypt(refreshToken);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: hashedRefreshToken },
    });

    return { access_token: accessToken, refresh_token: refreshToken };
  }
  async login(email: string, password: string) {
    const user = await this.findUser(email);
    const userMember = user.memberships.at(0)?.organizationId;
    if (!userMember) throw new ForbiddenException();

    //Verify password
    const verifiedPassword = await argon2.verify(user.passwordHash, password);
    if (!verifiedPassword)
      throw new UnauthorizedException('Wrong email or password');

    const memberships = await this.prisma.membership.findMany({
      where: { userId: user.id },
    });

    if (memberships.length === 0)
      throw new ForbiddenException(
        'User is not associated with any organization',
      );
    const activeMembership = memberships[0];
    const role = activeMembership.role;
    const tokens = await this.generateTokenPair(user, activeMembership);
    return { tokens, user, role };
  }

  async switchWorkspace(userId: string, targetOrganizationId: string) {
    const user = await this.findUser(undefined, userId);
    const membership = await this.findUserInOrg(user.id, targetOrganizationId);

    const tokens = await this.generateTokenPair(user, membership);
    const user_context = membership;
    return { tokens, user_context };
  }

  async refresh(refreshToken: string) {
    const payload = this.jwt.verify<{
      sub: string;
      email: string;
    }>(refreshToken);

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub },
      include: { memberships: true },
    });

    if (!user || !user.refreshTokenHash)
      throw new ForbiddenException('Access Denied');

    const isTokenValid = this.verifyHash(user.refreshTokenHash, refreshToken);
    if (!isTokenValid) throw new ForbiddenException('Access Denied');

    if (user.memberships.length === 0) {
      throw new ForbiddenException('User has no organization contexts');
    }

    const activeMembership = user.memberships[0];

    return this.generateTokenPair(user, activeMembership);
  }
  async logout(userId: string) {
    const user = await this.findUser(userId);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null },
    });
  }

  async signUp(data: SignUp) {
    const { name, email, password, organizationName } = data;
    const encryptPassword = await argon2.hash(password);

    const slug = `${organizationName.toLowerCase().replace(/\s+/g, '-')}-${crypto.randomUUID()}`;

    const organization = await this.prisma.organization.create({
      data: { name: organizationName, slug },
    });

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash: encryptPassword,
      },
    });

    await this.prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'ADMIN',
      },
    });

    return { message: 'User created successsfully' };
  }

  async me(userId: string, organizationId: string) {
    const membership = await this.findUserInOrg(userId, organizationId);
    const user = membership.user;

    return { user, role: membership.role };
  }
  //To-Do Forgot-Password Reset-Password
}
