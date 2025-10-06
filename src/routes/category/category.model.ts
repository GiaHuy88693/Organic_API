import z from 'zod';

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),

  createdById: z.string().nullable().optional(),
  updatedById: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable().optional(),
});

export const CategoryResponseSchema = CategorySchema.omit({ deletedAt: true });

export const CreateCategoryBodySchema = z
  .object({
    name: z.string().min(1),
    description: z.string().optional(),
    image: z.string().url().optional(), // cho phép trống
  })
  .strict();

export const UpdateCategoryBodySchema = CreateCategoryBodySchema.partial().strict();

export const GetCategoryQuerySchema = z.object({
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

export const GetCategoriesResSchema = z.object({
  data: z.array(CategoryResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export const GetAllCategoriesResSchema = z.object({
  data: z.array(
    CategorySchema.omit({
      deletedAt: true,
    }),
  ),
  totalItems: z.number(),
});

export const CreateCategoryResSchema = CategoryResponseSchema;
export const UpdateCategoryResSchema = CategoryResponseSchema;
export const GetCategoryDetailSchema = CategoryResponseSchema;

export type CategoryType = z.infer<typeof CategoryResponseSchema>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;
export type GetCategoryQueryType = z.infer<typeof GetCategoryQuerySchema>;
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>;
export type GetAllCategoriesResType = z.infer<typeof GetAllCategoriesResSchema>;
