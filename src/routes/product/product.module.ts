import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repo';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/shared/services/cloudinary.service';
import { CloudinaryUploader } from 'src/shared/uploader/cloudinary-uploader.adapter';

@Module({
  imports: [MulterModule.register({})],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    CloudinaryService,
    { provide: 'UploaderService', useClass: CloudinaryUploader },
  ],
})
export class ProductModule {}
