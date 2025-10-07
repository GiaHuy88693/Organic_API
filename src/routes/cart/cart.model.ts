import z from 'zod';

export const CartItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AddToCartBodySchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
});

export const UpdateCartItemBodySchema = z.object({
  quantity: z.coerce.number().int().min(0), // 0 => xoá item
});

export const GetCartQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const CartListResSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      product: z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
      }),
      quantity: z.number().int().min(1),
    }),
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>;
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>;
export type GetCartQueryType = z.infer<typeof GetCartQuerySchema>;
export type CartListResType = z.infer<typeof CartListResSchema>;
