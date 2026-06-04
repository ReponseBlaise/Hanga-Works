import { BadRequestException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CloudinaryService } from './cloudinary.service';
import { MediaPurpose, StorageService } from './storage.service';

const MAX_BYTES: Record<MediaPurpose, number> = {
  avatar: 5 * 1024 * 1024,
  'course-thumbnail': 10 * 1024 * 1024,
  'course-video': 200 * 1024 * 1024,
  'course-document': 25 * 1024 * 1024,
};

const ALLOWED_MIME: Record<MediaPurpose, RegExp> = {
  avatar: /^image\/(jpeg|png|webp|gif)$/i,
  'course-thumbnail': /^image\/(jpeg|png|webp)$/i,
  'course-video': /^video\//i,
  'course-document': /^(application\/pdf|application\/msword|application\/vnd\.openxmlformats|text\/plain)/i,
};

@Injectable()
export class MediaUploadService {
  constructor(
    private readonly cloudinary: CloudinaryService,
    private readonly storage: StorageService,
  ) {}

  assertPurposeAccess(purpose: MediaPurpose, user: CurrentUserPayload) {
    if (purpose === 'avatar') {
      return;
    }

    const role = user.role as Role;
    if (role !== Role.ADMIN && role !== Role.INSTITUTION && role !== Role.MENTOR) {
      throw new BadRequestException(
        'Only admins, institutions, and mentors can upload course media',
      );
    }
  }

  validateFile(purpose: MediaPurpose, file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('File is required');
    }

    if (file.size > MAX_BYTES[purpose]) {
      throw new BadRequestException(
        `File too large for ${purpose}. Max ${Math.round(MAX_BYTES[purpose] / (1024 * 1024))}MB`,
      );
    }

    if (!ALLOWED_MIME[purpose].test(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type "${file.mimetype}" for ${purpose}`,
      );
    }
  }

  async uploadFile(params: {
    purpose: MediaPurpose;
    file: Express.Multer.File;
    user: CurrentUserPayload;
    courseId?: string;
    moduleId?: string;
  }) {
    const { purpose, file, user, courseId, moduleId } = params;
    this.assertPurposeAccess(purpose, user);
    this.validateFile(purpose, file);

    if (purpose === 'avatar' && !this.cloudinary.isConfigured()) {
      throw new BadRequestException(
        'Profile photos use Cloudinary. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      );
    }

    if (this.cloudinary.isConfigured()) {
      const folder = this.cloudinary.buildFolder(
        purpose,
        user.userId,
        courseId,
        moduleId,
      );
      const resourceType = this.cloudinary.resourceTypeForPurpose(purpose);
      const uploaded = await this.cloudinary.uploadBuffer({
        buffer: file.buffer,
        folder,
        resourceType,
        originalName: file.originalname,
      });

      return {
        provider: 'cloudinary' as const,
        purpose,
        publicUrl: uploaded.secureUrl,
        publicId: uploaded.publicId,
        resourceType: uploaded.resourceType,
        bytes: uploaded.bytes,
        format: uploaded.format,
      };
    }

    throw new BadRequestException(
      'Cloudinary is required for uploads. Configure CLOUDINARY_* env vars or use POST /media/presign for S3.',
    );
  }

  async createUploadSignature(params: {
    purpose: MediaPurpose;
    user: CurrentUserPayload;
    courseId?: string;
    moduleId?: string;
    fileName: string;
    contentType: string;
  }) {
    this.assertPurposeAccess(params.purpose, params.user);

    if (params.purpose === 'avatar' && !this.cloudinary.isConfigured()) {
      throw new BadRequestException(
        'Profile photos use Cloudinary. Set CLOUDINARY_* environment variables.',
      );
    }

    if (params.purpose === 'avatar' || this.cloudinary.isConfigured()) {
      return this.cloudinary.createSignedUploadParams({
        purpose: params.purpose,
        userId: params.user.userId,
        courseId: params.courseId,
        moduleId: params.moduleId,
      });
    }

    return {
      provider: 's3' as const,
      ...(await this.storage.createPresignedUpload({
        purpose: params.purpose,
        fileName: params.fileName,
        contentType: params.contentType,
        userId: params.user.userId,
        courseId: params.courseId,
        moduleId: params.moduleId,
      })),
    };
  }
}
