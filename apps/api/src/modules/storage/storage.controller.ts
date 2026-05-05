import { Controller, Post, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import type { MultipartFile, MultipartValue } from '@fastify/multipart';
import { StorageService } from './storage.service';

@ApiTags('Storage')
@Controller({ path: 'storage', version: '1' })
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to Cloudflare R2' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(@Req() req: FastifyRequest) {
    let buffer: Buffer | undefined;
    let mimetype = 'application/octet-stream';
    let filename = 'upload';
    let businessId: string | undefined;

    for await (const part of (req as any).parts()) {
      if (part.type === 'file') {
        const filePart = part as MultipartFile;
        buffer = await filePart.toBuffer();
        mimetype = filePart.mimetype;
        filename = filePart.filename;
      } else {
        const field = part as MultipartValue<string>;
        if (field.fieldname === 'businessId') businessId = field.value;
      }
    }

    if (!buffer) throw new Error('No file provided');
    const url = await this.storageService.uploadFile(buffer, mimetype, filename, businessId);
    return { url };
  }
}
