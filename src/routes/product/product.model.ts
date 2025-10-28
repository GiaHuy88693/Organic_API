import z from 'zod';

export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  isPrimary: z.boolean(),
  productId: z.string(),
  createdAt: z.date(),
  createdById: z.string().nullable(),
});

export const ProductSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    price: z.number().nonnegative(),
    quantity: z.number().int().nonnegative(),
    categoryId: z.string().nullable().optional(),
    slug: z.string(),
    createdById: z.string().nullable().optional(),
    updatedById: z.string().nullable().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable().optional(),
  })
  .extend({
    images: z.array(ProductImageSchema).optional(),
  });

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
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(2).optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

export const GetAllProductsResSchema = z.object({
  data: z.array(
    ProductSchema.omit({
      deletedAt: true,
    }),
  ),
  totalItems: z.number(),
});

export const ListImagesResSchema = z.object({
  data: z.array(ProductSchema),
});

export const UploadImagesResSchema = GetAllProductsResSchema;
export const CreateProductResSchema = ProductResponseSchema;
export const UpdateProductResSchema = ProductResponseSchema;
export const GetProductDetailSchema = ProductResponseSchema;

export type ProductType = z.infer<typeof ProductResponseSchema>;
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;
export type GetProductQueryType = z.infer<typeof GetProductQuerySchema>;
export type GetProductsResType = z.infer<typeof GetProductsResSchema>;
export type GetAllProductsResType = z.infer<typeof GetAllProductsResSchema>;
