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

  async myOrganization(userId: string, organizationId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
      include: { organization: true },
    });
    const organization = membership?.organization;
    if (!organization) throw new BadRequestException('No organization found');
    const { id, name, slug } = organization;

    return { id, name, slug };
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
    const organization = await this.prisma.organization.findFirst({
      where: { id: organizationId, memberships: { some: { userId } } },
    });
    const { name, slug } = data;

    if (!organization) throw new NotFoundException('Organization not found');

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: {
        name: name ? name : organization.name,
        slug: slug ? slug : organization.slug,
      },
    });
  }

  async getMembers(organizationId: string, userId: string) {
    const organizationMembers = await this.prisma.organization.findUnique({
      where: {
        id: organizationId,
        memberships: { some: { userId, organizationId } },
      },
      include: { memberships: true },
    });

    return organizationMembers;
  }
  async removeMember(
    organizationId: string,
    userId: string,
    removedId: string,
  ) {
    const organization = await this.prisma.organization.update({
      where: {
        id: organizationId,
        memberships: {
          some: { id: userId, organizationId },
        },
      },
      data: {
        memberships: {
          delete: {
            userId_organizationId: { userId: removedId, organizationId },
          },
        },
      },
    });

    if (!organization)
      throw new BadRequestException('User to be removed not found');
  }
}
