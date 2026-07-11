import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTeam, UpdateTeam } from './dto/teams.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTeams(organization_id: string) {
    const teams = await this.prisma.team.findMany({
      where: { id: organization_id },
    });
    if (!teams) throw new NotFoundException('No teams found');
    return teams;
  }

  async createTeam(organization_id: string, data: CreateTeam) {
    const team = await this.prisma.team.create({
      data: {
        name: data.name,
        organizationId: organization_id,
      },
    });
    return team;
  }

  async getTeam(organization_id: string, team_id: string) {
    const team = await this.prisma.team.findFirst({
      where: { id: team_id, organizationId: organization_id },
      include: { teamMemberships: true },
    });
    return team;
  }

  async renameTeam(organization_id: string, team_id: string, data: UpdateTeam) {
    const [_, team] = await this.prisma.$transaction([
      this.prisma.team.findFirst({
        where: { id: team_id, organizationId: organization_id },
      }),
      this.prisma.team.updateMany({
        where: { id: team_id, organizationId: organization_id },
        data: { name: data.name },
      }),
    ]);

    return team;
  }

  async deleteTeam(organization_id: string, team_id: string) {
    await this.prisma.$transaction([
      this.prisma.team.findFirst({
        where: { id: team_id, organizationId: organization_id },
      }),
      this.prisma.team.deleteMany({
        where: { id: team_id, organizationId: organization_id },
      }),
    ]);

    return { message: 'Team deleted' };
  }

  async addUserToTeam(
    organization_id: string,
    team_id: string,
    user_id: string,
  ) {
    const user = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user_id,
          organizationId: organization_id,
        },
      },
    });
    if (!user)
      throw new NotFoundException('User not found in the organization');
    const team = await this.prisma.team.findFirst({
      where: { id: team_id, organizationId: organization_id },
    });
    if (!team) throw new NotFoundException('Team not found');

    await this.prisma.teamMemberships.create({
      data: {
        userId: user_id,
        organizationId: organization_id,
        teamId: team.id,
      },
    });

    return { message: 'User added to the team' };
  }

  async removeUserFromTeam(
    organization_id: string,
    team_id: string,
    user_id: string,
  ) {
    const user = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId: user_id,
          organizationId: organization_id,
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    await this.prisma.teamMemberships.deleteMany({
      where: {
        userId: user.id,
        organizationId: organization_id,
        teamId: team_id,
      },
    });
  }
}
