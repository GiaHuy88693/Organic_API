import { Injectable } from '@nestjs/common';
import { CloudinaryService } from '../services/cloudinary.service';

export interface UploaderService {
  upload(file: Express.Multer.File): Promise<string>;
  uploadMany(files: Express.Multer.File[]): Promise<string[]>;
}

@Injectable()
export class CloudinaryUploader implements UploaderService {
  constructor(private readonly cloudinary: CloudinaryService) {}

  async upload(file: Express.Multer.File): Promise<string> {
    const result = await this.cloudinary.uploadImage(file);
    return result;
  }

  async uploadMany(files: Express.Multer.File[]): Promise<string[]> {
    return Promise.all(files.map((f) => this.upload(f)));
  }
}
