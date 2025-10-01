import { BadRequestException, InternalServerErrorException } from '@nestjs/common';

export const NoFileProvidedException = new BadRequestException({
  message: 'Error.NoFileProvided',
  path: 'image',
});

export const ImageBufferNotFoundException = new InternalServerErrorException({
  message: 'Error.ImageBufferNotFound',
  path: 'image',
});
export const PdfBufferNotFoundException = new InternalServerErrorException({
  message: 'Error.PdfBufferNotFound',
  path: 'image',
});
