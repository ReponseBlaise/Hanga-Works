import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { MediaPurpose } from './storage.service';

export type CloudinaryResourceType = 'image' | 'video' | 'raw' | 'auto';

export type CloudinaryUploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  bytes: number;
  format?: string;
};

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly configured: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.configured = Boolean(cloudName && apiKey && apiSecret);

    if (this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.logger.log('Cloudinary configured');
    } else {
      this.logger.warn('Cloudinary is not configured — profile/course uploads will use S3 presign if available');
    }
  }

  isConfigured(): boolean {
    return this.configured;
  }

  getCloudName(): string {
    return process.env.CLOUDINARY_CLOUD_NAME ?? '';
  }

  buildFolder(purpose: MediaPurpose, userId: string, courseId?: string, moduleId?: string): string {
    const base = process.env.CLOUDINARY_FOLDER ?? 'hanga-works';

    switch (purpose) {
      case 'avatar':
        return `${base}/avatars/${userId}`;
      case 'course-thumbnail':
        if (!courseId) {
          throw new BadRequestException('courseId is required for course-thumbnail uploads');
        }
        return `${base}/courses/${courseId}/thumbnails`;
      case 'course-video':
        if (!courseId || !moduleId) {
          throw new BadRequestException(
            'courseId and moduleId are required for course-video uploads',
          );
        }
        return `${base}/courses/${courseId}/modules/${moduleId}/videos`;
      case 'course-document':
        if (!courseId || !moduleId) {
          throw new BadRequestException(
            'courseId and moduleId are required for course-document uploads',
          );
        }
        return `${base}/courses/${courseId}/modules/${moduleId}/documents`;
      default:
        throw new BadRequestException('Unsupported upload purpose');
    }
  }

  resourceTypeForPurpose(purpose: MediaPurpose): CloudinaryResourceType {
    switch (purpose) {
      case 'avatar':
      case 'course-thumbnail':
        return 'image';
      case 'course-video':
        return 'video';
      case 'course-document':
        return 'raw';
      default:
        return 'auto';
    }
  }

  async uploadBuffer(params: {
    buffer: Buffer;
    folder: string;
    resourceType: CloudinaryResourceType;
    originalName?: string;
  }): Promise<CloudinaryUploadResult> {
    if (!this.configured) {
      throw new BadRequestException(
        'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: params.folder,
          resource_type: params.resourceType,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error('Cloudinary upload failed'));
            return;
          }

          resolve({
            publicId: uploadResult.public_id,
            url: uploadResult.url,
            secureUrl: uploadResult.secure_url,
            resourceType: uploadResult.resource_type,
            bytes: uploadResult.bytes,
            format: uploadResult.format,
          });
        },
      );

      upload.end(params.buffer);
    });

    this.logger.log(
      `Cloudinary upload (${params.resourceType}) → ${result.publicId} [${params.originalName ?? 'file'}]`,
    );

    return result;
  }

  /** Params for frontend direct upload to Cloudinary (signed). */
  createSignedUploadParams(params: {
    purpose: MediaPurpose;
    userId: string;
    courseId?: string;
    moduleId?: string;
  }) {
    if (!this.configured) {
      throw new BadRequestException('Cloudinary is not configured');
    }

    const folder = this.buildFolder(
      params.purpose,
      params.userId,
      params.courseId,
      params.moduleId,
    );
    const resourceType = this.resourceTypeForPurpose(params.purpose);
    const timestamp = Math.round(Date.now() / 1000);

    const toSign: Record<string, string | number> = {
      timestamp,
      folder,
    };

    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
    if (uploadPreset) {
      toSign.upload_preset = uploadPreset;
    }

    const signature = cloudinary.utils.api_sign_request(
      toSign,
      process.env.CLOUDINARY_API_SECRET!,
    );

    return {
      provider: 'cloudinary' as const,
      cloudName: this.getCloudName(),
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      resourceType,
      uploadPreset: uploadPreset ?? null,
      purpose: params.purpose,
    };
  }
}
