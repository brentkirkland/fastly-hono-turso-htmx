import { z } from "zod";

export const zCuid = z.string().min(10).max(10);

export const zFormSchema = z.object({
  content: z.string(),
});
