import z from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  price: z.number().nonnegative(),
  quantity: z.number().int().nonnegative(),
  slug: z.string(),
  createdById: z.string().nullable().optional(),
  updatedById: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
})

export const ProductResponseSchema = ProductSchema.omit({
  deletedAt: true,
});

export const CreateProductBodySchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    quantity: z.number().int().nonnegative().default(0),
  })
  .strict();

export const UpdateProductBodySchema =
  CreateProductBodySchema.partial().strict();

export const GetProductsResSchema = z.object({
  data: z.array(ProductResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export const GetProductQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, { message: 'Page must be a positive number' }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, {
      message: 'Limit must be between 1 and 100',
    }),
  search: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim() : undefined))
    .refine((val) => !val || val.length >= 2, {
      message: 'Search term must be at least 2 characters long',
    }),
  includeDeleted: z
    .string()
    .optional()
    .transform((val) => val === 'true')
    .default('false'),
});

export const GetAllProductsResSchema = z.object({
  data: z.array(
    ProductSchema.omit({
      deletedAt: true,
    }),
  ),
  totalItems: z.number(),
});

export const CreateProductResSchema = ProductResponseSchema;
export const UpdateProductResSchema = ProductResponseSchema;
export const GetProductDetailSchema = ProductResponseSchema;

export type ProductType = z.infer<typeof ProductResponseSchema>;
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;
export type GetProductQueryType = z.infer<typeof GetProductQuerySchema>;
export type GetProductsResType = z.infer<typeof GetProductsResSchema>;
export type GetAllProductsResType = z.infer<typeof GetAllProductsResSchema>;
