import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { CloudinaryService } from './cloudinary.service';
import { MediaUploadService } from './media-upload.service';
import { MediaController } from './media.controller';

@Global()
@Module({
  controllers: [MediaController],
  providers: [StorageService, CloudinaryService, MediaUploadService],
  exports: [StorageService, CloudinaryService, MediaUploadService],
})
export class StorageModule {}
