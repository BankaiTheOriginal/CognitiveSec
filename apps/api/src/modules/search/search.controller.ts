import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtGuard, TenantGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('')
  async search(
    @CurrentUser() user: AuthenticatedUser,
    @Query('q') q?: string,
  ) {
    return this.searchService.search(user.organizationId, user.id, q ?? '');
  }
}
