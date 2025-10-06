import { createZodDto } from 'nestjs-zod';
import {
  GetWishlistQuerySchema,
  GetWishlistResSchema,
  ToggleWishlistResSchema,
} from '../withlist.model';

export class ToggleWishlistResDTO extends createZodDto(
  ToggleWishlistResSchema,
) {}
export class GetWishlistQueryDTO extends createZodDto(GetWishlistQuerySchema) {}
export class GetWishlistResDTO extends createZodDto(GetWishlistResSchema) {}
