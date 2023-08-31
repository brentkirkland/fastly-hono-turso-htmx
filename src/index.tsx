/// <reference types="@fastly/js-compute" />

import { Hono, MiddlewareHandler } from "hono";
import { html } from "hono/html";
import type { Client } from "@libsql/client/web";

// TODO: issue 1: esbuild doesn't like this import below
// This import is resolved by the /// reference above
// import { SecretStore } from "fastly:secret-store";

import { BaseHtml } from "./components/layout/base";
import { Body } from "./components/layout/body";
import { TodoList } from "./components/todo/todo-list";
import { TodoItem } from "./components/todo/todo-item";
import { createDb } from "./db";
import { formSchema, zTodo, zTodos } from "./zod";
import { getFormData } from "./utils";

declare module "hono" {
  interface ContextVariableMap {
    db: Client;
  }
}

const app = new Hono();

const dbMiddleware: MiddlewareHandler = async (c, next) => {
  // TODO: issue 1: we have to use this workaround for now
  // @ts-expect-error - still got to figure out esbuild and /// imports
  const secretStore = new SecretStore("fhth_secrets");
  const authTokenObj = await secretStore.get("DB_AUTH_TOKEN");
  const urlObj = await secretStore.get("DB_URL");

  if (!authTokenObj || !urlObj) {
    return c.text("Missing env", 500);
  }

  const authToken = authTokenObj.plaintext();
  const url = urlObj.plaintext();

  c.set(
    "db",
    createDb({
      url,
      authToken,
    })
  );

  return next();
};

app.use("*", dbMiddleware);

app.get("/", async (c) => {
  const db = c.get("db");
  const [, data] = await db.batch([
    "CREATE TABLE IF NOT EXISTS todos (id INTEGER PRIMARY KEY AUTOINCREMENT, content TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0)",
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

app.post("/todos", async (c) => {
  const db = c.get("db");
  const formData = await getFormData(c.req);

  const parsed = formSchema.safeParse({
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return c.text("Invalid!", 401);
  }

  const res = await db.execute({
    sql: `INSERT INTO todos (content) VALUES (?)`,
    args: [parsed.data.content],
  });

  const todo = zTodo.safeParse({
    id: Number(res.lastInsertRowid),
    content: parsed.data.content,
    completed: 0,
  });
  if (!todo.success) {
    return c.text("Invalid data", 406);
  }

  return c.html(<TodoItem {...todo.data} />);
});

app.post("/todos/toggle/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");
  const numberId = Number(id);

  if (isNaN(numberId)) {
    c.status(400);
    return c.text("Invalid id", 401);
  }

  const oldTodo = await db.execute({
    sql: `SELECT * FROM todos WHERE id = ?`,
    args: [numberId],
  });

  if (!oldTodo) {
    c.status(404);
    return c.text("Missing todo", 404);
  }

  const newDirection = oldTodo.rows[0].completed === 0 ? 1 : 0;

  await db.execute({
    sql: `UPDATE todos SET completed = ? WHERE id = ?`,
    args: [newDirection, numberId],
  });

  const todo = zTodo.safeParse({
    id: numberId,
    content: oldTodo.rows[0].content,
    completed: newDirection,
  });
  if (!todo.success) {
    return c.text("Invalid data", 406);
  }

  return c.html(<TodoItem {...todo.data} />);
});

app.delete("/todos/:id", async (c) => {
  const db = c.get("db");
  const id = Number(c.req.param("id"));
  await db.execute({
    sql: `DELETE FROM todos WHERE id = ?`,
    args: [id],
  });
  return c.html(html`<div />`);
});

app.fire();