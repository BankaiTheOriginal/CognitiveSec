import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { UpdateOrganization } from './dto/organization.dto';

@Controller('organizations')
@UseGuards(JwtGuard, TenantGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.myOrganization(
      user.id,
      user.organizationId,
    );
  }
  @Get('me/organizations')
  async myOrganizations(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.myOrganizations(user.id);
  }

  @Patch('me')
  async updateOrganization(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateOrganization,
  ) {
    await this.organizationsService.updateOrganization(
      user.id,
      user.organizationId,
      body,
    );
    return {
      success: 'Organization successfully updated',
    };
  }

  @Get('me/members')
  async getMembers(@CurrentUser() user: AuthenticatedUser) {
    return this.organizationsService.getMembers(user.organizationId, user.id);
  }

  @Delete('me/members/:id')
  async removeMember(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.organizationsService.removeMember(
      user.organizationId,
      user.id,
      id,
    );
  }
}
