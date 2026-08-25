import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UpdateOrganization } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async recordActivity(input: {
    organizationId: string;
    actorId?: string;
    actorName?: string;
    action: string;
    entityType: string;
    entityId?: string;
    message: string;
    metadata?: unknown;
  }) {
    return this.prisma.activityEvent.create({
      data: {
        organizationId: input.organizationId,
        actorId: input.actorId,
        actorName: input.actorName,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        message: input.message,
        metadata: input.metadata as any,
      },
    });
  }

  async myOrganization(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { organization: true },
    });
    const organization = membership?.organization;
    if (!organization) throw new BadRequestException('No organization found');
    const { id, name, slug, createdAt, updatedAt } = organization;

    return { id, name, slug, createdAt, updatedAt };
  }

  async myOrganizations(userId: string) {
    const organizations = await this.prisma.membership.findMany({
      where: { userId },
      include: { organization: true },
    });

    return organizations;
  }

  async updateOrganization(
    userId: string,
    organizationId: string,
    data: UpdateOrganization,
  ) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { organization: true, user: true },
    });

    if (!membership) throw new NotFoundException('Organization not found');

    const { name, slug } = data;
    const updatedOrganization = await this.prisma.organization.update({
      where: { id: membership.organizationId },
      data: {
        name: name?.trim() || membership.organization.name,
        slug: slug?.trim() || membership.organization.slug,
      },
    });

    await this.recordActivity({
      organizationId,
      actorId: membership.user.id,
      actorName: membership.user.name,
      action: 'ORGANIZATION_UPDATED',
      entityType: 'organization',
      entityId: updatedOrganization.id,
      message: 'Updated organization settings',
      metadata: {
        before: {
          name: membership.organization.name,
          slug: membership.organization.slug,
        },
        after: {
          name: updatedOrganization.name,
          slug: updatedOrganization.slug,
        },
      },
    });

    return updatedOrganization;
  }

  async getMembers(organizationId: string, userId: string) {
    const organizationMembers = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
      },
      include: {
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!organizationMembers?.memberships.some((member) => member.userId === userId))
      throw new NotFoundException('Organization not found');

    return organizationMembers;
  }

  async getActivity(organizationId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });

    if (!membership) throw new NotFoundException('Organization not found');

    return this.prisma.activityEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async removeMember(
    organizationId: string,
    userId: string,
    removedId: string,
  ) {
    const actorMembership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { user: true },
    });

    if (!actorMembership) throw new BadRequestException('User to be removed not found');

    const targetMembership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId: removedId, organizationId } },
      include: { user: true },
    });

    if (!targetMembership)
      throw new BadRequestException('User to be removed not found');

    await this.prisma.membership.delete({
      where: {
        userId_organizationId: { userId: removedId, organizationId },
      },
    });

    await this.recordActivity({
      organizationId,
      actorId: actorMembership.user.id,
      actorName: actorMembership.user.name,
      action: 'MEMBER_REMOVED',
      entityType: 'membership',
      entityId: targetMembership.id,
      message: `Removed ${targetMembership.user.name} from the organization`,
      metadata: {
        removedUserId: targetMembership.userId,
        removedUserName: targetMembership.user.name,
      },
    });
  }
}
