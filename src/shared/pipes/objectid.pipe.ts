import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string> {
  transform(value: string) {
    const ok = /^[0-9a-fA-F]{24}$/.test(value);
    if (!ok) {
      throw new BadRequestException({ message: 'Invalid ObjectId', path: 'id' });
    }
    return value;
  }
}
