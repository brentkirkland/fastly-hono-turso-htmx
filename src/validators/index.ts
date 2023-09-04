import { validator } from "hono/validator";
import { zFormSchema, zCuid } from "../zod";

export const cuidValidator = validator("param", (value, c) => {
  const { id } = value;
  const parsed = zCuid.safeParse(id);
  if (!parsed.success) {
    return c.text("Invalid!", 400);
  }
  return { id: parsed.data };
});

export const formValidator = validator("form", (value, c) => {
  const content = value["content"];
  const parsed = zFormSchema.safeParse({
    content,
  });
  if (!parsed.success) {
    return c.text("Invalid!", 400);
  }
  return parsed.data;
});
