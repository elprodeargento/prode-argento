import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  async generatePresignedUrl(filename: string, contentType: string) {
    const bucket = this.config.get<string>('app.cloudflareR2Bucket')!;
    const publicUrlBase = this.config.get<string>('app.cloudflareR2PublicUrl')!;
    
    // Create a unique key using timestamp
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `${timestamp}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${publicUrlBase}/${objectKey}`;

    return { presignedUrl, publicUrl, objectKey };
  }
}
