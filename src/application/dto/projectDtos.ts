import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens'),
  summary: z.string().max(500).nullable().optional(),
  body: z.string().nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  isFeatured: z.boolean().optional(),
  location: z.string().max(200).nullable().optional(),
  clientName: z.string().max(200).nullable().optional(),
  areaSqft: z.number().int().positive().nullable().optional(),
  completedAt: z.date().nullable().optional(),
  coverMediaId: z.string().uuid().nullable().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial().extend({
  id: z.string().uuid(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
