import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { CreateTeam, UpdateTeam } from './dto/teams.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'generated/prisma/enums';

@Controller('teams')
@UseGuards(JwtGuard, TenantGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get('')
  async getTeams(@CurrentUser() user: AuthenticatedUser) {
    return this.teamsService.getTeams(user.organizationId);
  }

  @Roles('ADMIN')
  @Post('')
  async createTeam(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateTeam,
  ) {
    return this.teamsService.createTeam(user.organizationId, body);
  }

  @Get(':id')
  async getTeam(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.teamsService.getTeam(user.organizationId, id);
  }

  @Roles('ADMIN')
  @Patch(':id')
  async renameTeam(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateTeam,
  ) {
    return this.teamsService.renameTeam(user.organizationId, id, body);
  }

  @Roles('ADMIN')
  @Delete(':id')
  async deleteTeam(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.teamsService.deleteTeam(user.organizationId, id);
  }

  @Roles('ADMIN')
  @Post(':id/members')
  async addUserToTeam(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.teamsService.addUserToTeam(user.organizationId, id, user.id);
  }

  @Roles('ADMIN')
  @Delete(':id/members/:uid')
  async removeUserFromTeam(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Param('uid') uid: string,
  ) {
    return this.teamsService.removeUserFromTeam(user.organizationId, id, uid);
  }
}
