import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { S3Client, S3ClientConfig, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export type MediaPurpose =
  | 'avatar'
  | 'course-thumbnail'
  | 'course-video'
  | 'course-document';

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

  buildPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
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
    return this.buildPublicUrl(key);
  }

  async createPresignedUpload(params: {
    purpose: MediaPurpose;
    fileName: string;
    contentType: string;
    userId: string;
    courseId?: string;
    moduleId?: string;
  }) {
    if (!process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY) {
      throw new BadRequestException(
        'Object storage is not configured. Set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_BUCKET.',
      );
    }

    const safeName = params.fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = this.buildObjectKey(params, safeName);

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 900 });
    const publicUrl = this.buildPublicUrl(key);

    this.logger.log(`Presigned upload for ${params.purpose}: ${key}`);

    return {
      key,
      uploadUrl,
      publicUrl,
      expiresInSeconds: 900,
      purpose: params.purpose,
    };
  }

  private buildObjectKey(
    params: {
      purpose: MediaPurpose;
      userId: string;
      courseId?: string;
      moduleId?: string;
    },
    fileName: string,
  ) {
    const stamp = Date.now();

    switch (params.purpose) {
      case 'avatar':
        return `users/${params.userId}/avatar/${stamp}-${fileName}`;
      case 'course-thumbnail':
        if (!params.courseId) {
          throw new BadRequestException('courseId is required for course-thumbnail uploads');
        }
        return `courses/${params.courseId}/thumbnails/${stamp}-${fileName}`;
      case 'course-video':
        if (!params.courseId || !params.moduleId) {
          throw new BadRequestException(
            'courseId and moduleId are required for course-video uploads',
          );
        }
        return `courses/${params.courseId}/modules/${params.moduleId}/videos/${stamp}-${fileName}`;
      case 'course-document':
        if (!params.courseId || !params.moduleId) {
          throw new BadRequestException(
            'courseId and moduleId are required for course-document uploads',
          );
        }
        return `courses/${params.courseId}/modules/${params.moduleId}/documents/${stamp}-${fileName}`;
      default:
        throw new BadRequestException('Unsupported upload purpose');
    }
  }
}
