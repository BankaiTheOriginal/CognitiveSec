import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateRole, UpdateUser } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}
  async me(userId: string, organizationId: string) {
    const membership = await this.authService.findUserInOrg(
      userId,
      organizationId,
    );
    return membership.user;
  }

  async updateMe(userId: string, organizationId: string, data: UpdateUser) {
    const membership = await this.authService.findUserInOrg(
      userId,
      organizationId,
    );

    const updatedUser = await this.prisma.user.update({
      where: { id: membership.user.id },
      data: { name: data.name },
    });

    return updatedUser;
  }

  async updateUserRole(
    userId: string,
    organizationId: string,
    targetUserId: string,
    data: UpdateRole,
  ) {
    const membership = await this.authService.findUserInOrg(
      userId,
      organizationId,
    );

    const targetMembership = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId: membership.organizationId,
        },
      },
      include: { user: true },
    });

    if (!targetMembership) {
      throw new NotFoundException('User not found in organization');
    }

    const updatedUser = await this.prisma.membership.update({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId: membership.organizationId,
        },
      },
      data: { role: data.role },
    });

    await this.prisma.activityEvent.create({
      data: {
        organizationId,
        actorId: membership.user.id,
        actorName: membership.user.name,
        action: 'ROLE_UPDATED',
        entityType: 'membership',
        entityId: targetMembership.id,
        message: `Changed ${targetMembership.user.name}'s role to ${data.role}`,
        metadata: {
          targetUserId,
          targetUserName: targetMembership.user.name,
          role: data.role,
        },
      },
    });

    return updatedUser;
  }
}
