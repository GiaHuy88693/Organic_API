import z from 'zod';

export const OrderSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  totalAmount: z.number().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const OrderDetailSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().nonnegative(),
});

export const CheckoutFromCartResSchema = z.object({
  orderId: z.string(),
  totalAmount: z.number().nonnegative(),
});

export const GetOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const OrdersListResSchema = z.object({
  data: z.array(
    OrderSchema.pick({ id: true, userId: true, totalAmount: true, createdAt: true }),
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const OrderDetailResSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  totalAmount: z.number(),
  createdAt: z.date(),
  items: z.array(
    z.object({
      id: z.string(),
      product: z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(), 
      }),
      quantity: z.number().int().min(1),
      price: z.number().nonnegative(),
    }),
  ),
});

export type GetOrdersQueryType = z.infer<typeof GetOrdersQuerySchema>;
export type OrdersListResType = z.infer<typeof OrdersListResSchema>;
