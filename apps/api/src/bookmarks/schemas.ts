import { z } from "zod";

export const bookmarkCreateSchema = z.object({
  userId: z.uuid(),
  title: z.string().min(1),
  url: z.url(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const bookmarkUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    url: z.url().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "envie ao menos um campo para atualizar",
  });
