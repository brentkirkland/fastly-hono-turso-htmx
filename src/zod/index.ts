import { z } from "zod";

export const zCuid = z.string().cuid2();

export const zTodo = z.object({
  id: zCuid,
  content: z.string(),
  completed: z.number().min(0).max(1),
});

export const zTodos = z.array(zTodo);

export type Todo = z.infer<typeof zTodo>;
export type Todos = z.infer<typeof zTodos>;

export const formSchema = z.object({
  content: z.string(),
});
