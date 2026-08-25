import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { UpdateRole, UpdateUser } from './dto/users.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtGuard, TenantGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.me(user.id, user.organizationId);
  }

  @Patch('me')
  async updateUser(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: UpdateUser,
  ) {
    return this.usersService.updateMe(user.id, user.organizationId, body);
  }

  @Roles('ADMIN')
  @Patch(':id/role')
  async updateUserRole(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: UpdateRole,
  ) {
    return this.usersService.updateUserRole(
      user.id,
      user.organizationId,
      id,
      body,
    );
  }
}
