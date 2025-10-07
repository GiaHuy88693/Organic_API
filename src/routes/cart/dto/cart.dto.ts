import { createZodDto } from 'nestjs-zod';
import {
  AddToCartBodySchema,
  CartListResSchema,
  GetCartQuerySchema,
  UpdateCartItemBodySchema,
} from '../cart.model';

export class AddToCartBodyDTO extends createZodDto(AddToCartBodySchema) {}
export class UpdateCartItemBodyDTO extends createZodDto(
  UpdateCartItemBodySchema,
) {}
export class GetCartQueryDTO extends createZodDto(GetCartQuerySchema) {}
export class CartListResDTO extends createZodDto(CartListResSchema) {}
