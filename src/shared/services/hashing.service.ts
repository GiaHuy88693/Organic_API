import { Injectable } from '@nestjs/common';
import { envConfig } from '../config';
import { compare, hash } from 'bcrypt';

@Injectable()
export class HashingService {
  hashPassword(password: string): Promise<string> {
    return hash(password, envConfig.satlRounds);
  }

  comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
  }
}
