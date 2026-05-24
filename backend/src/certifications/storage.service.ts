import { Injectable, Logger } from '@nestjs/common';
import { S3Client, S3ClientConfig, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket = process.env.S3_BUCKET ?? 'hanga-certs';
  private readonly publicUrl = (process.env.S3_PUBLIC_URL ?? '').replace(/\/$/, '');

  constructor() {
    const config: S3ClientConfig = {
      region: process.env.S3_REGION ?? 'auto',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
      },
    };

    if (process.env.S3_ENDPOINT) {
      config.endpoint = process.env.S3_ENDPOINT;
    }

    this.client = new S3Client(config);
  }

  async uploadPdf(key: string, buffer: Buffer): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: 'application/pdf',
      }),
    );
    return `${this.publicUrl}/${key}`;
  }
}
