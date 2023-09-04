/// <reference types="@fastly/js-compute" />

import { Hono } from "hono";
import { html } from "hono/html";
import { poweredBy } from "hono/powered-by";

import type { Client } from "@libsql/client/web";

import { FormData } from "formdata-polyfill/esm.min.js";

import { BaseHtml } from "./components/layout/base";
import { Body } from "./components/layout/body";
import { TodoList } from "./components/todo/todo-list";
import { TodoItem } from "./components/todo/todo-item";
import { TodoCheckbox } from "./components/todo/todo-checkbox";
import { zTodo, zTodos } from "./zod";
import { cuidMiddleware, dbMiddleware, loggerMiddleware } from "./middleware";
import { cuidValidator, formValidator } from "./validators";

globalThis.FormData = FormData;

// NOTE: we extend context to hono
declare module "hono" {
  interface ContextVariableMap {
    db: Client;
    cuid2: () => string;
  }
}

const app = new Hono();

app.use("*", loggerMiddleware);
app.use("*", poweredBy());
app.use("*", dbMiddleware);

app.get("/", async (c) => {
  const db = c.get("db");
  const [, data] = await db.batch([
    "CREATE TABLE IF NOT EXISTS todos (id TEXT PRIMARY KEY, content TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0)",
    "select * from todos",
  ]);

  if (!(data && data.rows)) {
    return c.text("Data not found", 404);
  }

  const todos = zTodos.safeParse(data.rows);

  if (!todos.success) {
    return c.text("Invalid data", 406);
  }
  return c.html(
    <BaseHtml>
      <Body>
        <TodoList todos={todos.data} />
      </Body>
    </BaseHtml>
  );
});

app.post("/todos", cuidMiddleware, formValidator, async (c) => {
  const db = c.get("db");
  const cuid2 = c.get("cuid2");

  const { content } = c.req.valid("form");
  const id = cuid2();

  await db.execute({
    sql: `INSERT INTO todos (id, content) VALUES (?, ?)`,
    args: [id, content],
  });

  return c.html(<TodoItem id={id} content={content} completed={0} />);
});

app.post("/todos/toggle/:id", cuidValidator, async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");

  const oldTodo = await db.execute({
    sql: `SELECT * FROM todos WHERE id = ?`,
    args: [id],
  });

  if (!oldTodo) {
    c.status(404);
    return c.text("Missing todo", 404);
  }

  const newDirection = oldTodo.rows[0].completed === 0 ? 1 : 0;

  await db.execute({
    sql: `UPDATE todos SET completed = ? WHERE id = ?`,
    args: [newDirection, id],
  });

  const todo = zTodo.safeParse({
    id,
    content: oldTodo.rows[0].content,
    completed: newDirection,
  });
  if (!todo.success) {
    return c.text("Invalid data", 406);
  }

  return c.html(<TodoCheckbox {...todo.data} />);
});

app.delete("/todos/:id", cuidValidator, async (c) => {
  const db = c.get("db");
  const { id } = c.req.valid("param");

  await db.execute({
    sql: `DELETE FROM todos WHERE id = ?`,
    args: [id],
  });
  return c.html(html`<div />`);
});

app.fire();
