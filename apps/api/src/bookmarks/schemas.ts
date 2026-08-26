import { z } from "zod";

export const bookmarkCreateSchema = z.object({
  userId: z.uuid(),
  title: z.string().min(1),
  url: z.url(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const bookmarkUpdateSchema = bookmarkCreateSchema
  .omit({ userId: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });

export type BookmarkCreate = z.infer<typeof bookmarkCreateSchema>;
export type BookmarkUpdate = z.infer<typeof bookmarkUpdateSchema>;
