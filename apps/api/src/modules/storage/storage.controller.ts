import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { PresignedUrlDto } from './dto/presigned-url.dto';

@ApiTags('Storage')
@Controller({ path: 'storage', version: '1' })
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate a presigned URL for Cloudflare R2 upload' })
  generatePresignedUrl(@Body() body: PresignedUrlDto) {
    return this.storageService.generatePresignedUrl(body.filename, body.contentType);
  }
}
