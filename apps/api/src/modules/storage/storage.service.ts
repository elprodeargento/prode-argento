import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private s3Client: S3Client;

  constructor(private readonly config: ConfigService) {
    const accountId = this.config.get<string>('app.cloudflareR2AccountId')!;
    const accessKey = this.config.get<string>('app.cloudflareR2AccessKey')!;
    const secretKey = this.config.get<string>('app.cloudflareR2SecretKey')!;

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      forcePathStyle: true,
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  async uploadFile(buffer: Buffer, contentType: string, filename: string, businessId?: string): Promise<string> {
    const bucket = this.config.get<string>('app.cloudflareR2Bucket')!;
    const publicUrlBase = this.config.get<string>('app.cloudflareR2PublicUrl')!;

    const timestamp = Date.now();
    const clean = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectName = `${timestamp}-${clean}`;
    const key = businessId ? `businesses/${businessId}/${objectName}` : objectName;

    await this.s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));

    return `${publicUrlBase}/${key}`;
  }
}
