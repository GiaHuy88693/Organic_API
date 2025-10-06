import z from 'zod';

export const WishlistItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  createdAt: z.date(),
});

export const ToggleWishlistResSchema = z.object({
  liked: z.boolean(),
});

export const GetWishlistQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const GetWishlistResSchema = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      product: z.object({
        id: z.string(),
        name: z.string(),
      }),
      createdAt: z.date(),
    }),
  ),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export type WishlistItemType = z.infer<typeof WishlistItemSchema>;
export type GetWishlistQueryType = z.infer<typeof GetWishlistQuerySchema>;
export type GetWishlistResType = z.infer<typeof GetWishlistResSchema>;
