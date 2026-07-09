import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get('')
  async getDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.documentService.getDocuments(user.organizationId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.documentService.uploadDocument(
      file,
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
