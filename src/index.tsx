/// <reference types="@fastly/js-compute" />

import { Hono } from "hono";
import { html } from "hono/html";
import { poweredBy } from "hono/powered-by";

import { FormData } from "formdata-polyfill/esm.min.js";

import { BaseHtml } from "./components/layout/base";
import { Body } from "./components/layout/body";
import { TodoList } from "./components/todo/todo-list";
import { TodoItem } from "./components/todo/todo-item";
import { TodoCheckbox } from "./components/todo/todo-checkbox";
import { cuidMiddleware, dbMiddleware, loggerMiddleware } from "./middleware";
import { cuidValidator, formValidator } from "./validators";
import { DbClient } from "./db";
import { schema } from "./db/schema";
import { eq } from "drizzle-orm";

globalThis.FormData = FormData;

// NOTE: we extend context to hono
declare module "hono" {
  interface ContextVariableMap {
    db: DbClient;
    cuid2: () => string;
  }
}

const app = new Hono();

app.use("*", loggerMiddleware);
app.use("*", poweredBy());
app.use("*", dbMiddleware);

app.get("/", async (c) => {
  const db = c.get("db");

  const todos = await db.select().from(schema.todos);

  if (!todos) {
    return c.text("Data not found", 404);
  }

  return c.html(
    <BaseHtml>
      <Body>
        <TodoList todos={todos} />
      </Body>
    </BaseHtml>
  );
});

app.post("/todos", cuidMiddleware, formValidator, async (c) => {
  const db = c.get("db");
  const cuid2 = c.get("cuid2");

  const { content } = c.req.valid("form");
  const id = cuid2();

  const insertedTodos = await db
    .insert(schema.todos)
    .values({
      id,
      content,
    })
    .returning();
  const todo = insertedTodos[0];

  return c.html(<TodoItem {...todo} />);
});

app.post("/todos/toggle/:id", cuidValidator, async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");

  const oldTodos = await db
    .select()
    .from(schema.todos)
    .where(eq(schema.todos.id, id));

  const oldTodo = oldTodos[0];

  if (!oldTodo) {
    c.status(404);
    return c.text("Missing todo", 404);
  }

  const updatedTodos = await db
    .update(schema.todos)
    .set({
      completed: !oldTodo.completed,
    })
    .where(eq(schema.todos.id, id))
    .returning();

  const updatedTodo = updatedTodos[0];

  if (!updatedTodo) {
    return c.text("Invalid data", 406);
  }

  return c.html(<TodoCheckbox {...updatedTodo} />);
});

app.delete("/todos/:id", cuidValidator, async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");

  await db.delete(schema.todos).where(eq(schema.todos.id, id));

  return c.html(html`<div />`);
});

app.fire();
