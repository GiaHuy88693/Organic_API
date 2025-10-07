import { createZodDto } from 'nestjs-zod';
import {
  CheckoutFromCartResSchema,
  GetOrdersQuerySchema,
  OrdersListResSchema,
  OrderDetailResSchema,
} from '../order.model';

export class CheckoutFromCartResDTO extends createZodDto(
  CheckoutFromCartResSchema,
) {}
export class GetOrdersQueryDTO extends createZodDto(GetOrdersQuerySchema) {}
export class OrdersListResDTO extends createZodDto(OrdersListResSchema) {}
export class OrderDetailResDTO extends createZodDto(OrderDetailResSchema) {}
