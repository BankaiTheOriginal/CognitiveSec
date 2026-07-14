import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { TenantGuard } from 'src/common/guards/tenant.guard';

@Controller('documents')
@UseGuards(JwtGuard, TenantGuard)
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('')
  async getDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.documentService.getDocuments(user.organizationId);
  }

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentService.uploadDocuments(
      files,
      user.id,
      user.organizationId,
    );
  }

  @Get(':id')
  async getDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.documentService.getDocument(id, user.organizationId, user.id);
  }

  @Delete(':id')
  async deleteDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    await this.documentService.deleteDocument(id, user.id, user.organizationId);
    return { message: 'Document deleted successfully' };
  }

  @Post(':id/reindex')
  async reindex(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.documentService.reindex(id, user.organizationId, user.id);
  }

  @Get(':id/chunks')
  async chunks(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.documentService.getChunks(id, user.organizationId, user.id);
  }
  @Get(':id/status')
  async status(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.documentService.getStatus(id, user.organizationId, user.id);
  }
}
