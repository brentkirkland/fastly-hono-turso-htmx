/// <reference types="@fastly/js-compute" />

import { Hono, MiddlewareHandler } from "hono";
import { html } from "hono/html";
import type { Client } from "@libsql/client/web";

import { BaseHtml } from "./components/layout/base";
import { Body } from "./components/layout/body";
import { TodoList } from "./components/todo/todo-list";
import { TodoItem } from "./components/todo/todo-item";
import { createDb } from "./db";
import { formSchema, zCuid, zTodo, zTodos } from "./zod";
import { getFormData } from "./utils";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import { TodoCheckbox } from "./components/todo/todo-checkbox";
import { init } from "@paralleldrive/cuid2";
import { ConfigStore } from "fastly:config-store";
import { env } from "fastly:env";
import { validator } from "hono/validator";
import { FormData } from "formdata-polyfill/esm.min.js";

globalThis.FormData = FormData;

// NOTE: we extend context to hono
declare module "hono" {
  interface ContextVariableMap {
    db: Client;
    cuid2: () => string;
  }
}

const app = new Hono();

const dbMiddleware: MiddlewareHandler = async (c, next) => {
  const configStore = new ConfigStore("fhth_config");
  const authToken = await configStore.get("DB_AUTH_TOKEN");
  const url = await configStore.get("DB_URL");

  if (!authToken || !url) {
    return c.text("Missing env", 500);
  }

  c.set(
    "db",
    createDb({
      url,
      authToken,
    })
  );

  return next();
};

const cuidMiddleware: MiddlewareHandler = async (c, next) => {
  const createdId = init({
    length: 10,
    fingerprint: env("FASTLY_POP"),
  });
  c.set("cuid2", createdId);
  return next();
};

app.use("*", (c, next) => {
  // @ts-expect-error
  const l = new Logger("fhth_logger");
  return logger((msg, rest) => l.log(JSON.stringify({ msg, rest })))(c, next);
});
app.use("*", poweredBy());
app.use("*", dbMiddleware);

app.get("/", async (c) => {
  const db = c.get("db");
  const [, data] = await db.batch([
    "CREATE TABLE IF NOT EXISTS todosV2 (id TEXT PRIMARY KEY, content TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0)",
    "select * from todosV2",
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

app.post(
  "/todos",
  cuidMiddleware,
  validator("form", (value, c) => {
    const content = value["content"];
    const parsed = formSchema.safeParse({
      content,
    });
    if (!parsed.success) {
      return c.text("Invalid!", 401);
    }
    return parsed.data;
  }),
  async (c) => {
    const db = c.get("db");
    const cuid2 = c.get("cuid2");

    const { content } = c.req.valid("form");
    const id = cuid2();

    await db.execute({
      sql: `INSERT INTO todosV2 (id, content) VALUES (?, ?)`,
      args: [id, content],
    });

    return c.html(<TodoItem id={id} content={content} completed={0} />);
  }
);

app.post("/todos/toggle/:id", async (c) => {
  const db = c.get("db");
  const id = c.req.param("id");

  const parseCuid = zCuid.safeParse(id);

  if (!parseCuid.success) {
    c.status(400);
    return c.text("Invalid id", 401);
  }

  const cuidId = parseCuid.data;

  const oldTodo = await db.execute({
    sql: `SELECT * FROM todosV2 WHERE id = ?`,
    args: [cuidId],
  });

  if (!oldTodo) {
    c.status(404);
    return c.text("Missing todo", 404);
  }

  const newDirection = oldTodo.rows[0].completed === 0 ? 1 : 0;

  await db.execute({
    sql: `UPDATE todosV2 SET completed = ? WHERE id = ?`,
    args: [newDirection, cuidId],
  });

  const todo = zTodo.safeParse({
    id: cuidId,
    content: oldTodo.rows[0].content,
    completed: newDirection,
  });
  if (!todo.success) {
    return c.text("Invalid data", 406);
  }

  return c.html(<TodoCheckbox {...todo.data} />);
});

app.delete("/todos/:id", async (c) => {
  const db = c.get("db");
  const id = Number(c.req.param("id"));

  const parseCuid = zCuid.safeParse(id);

  if (!parseCuid.success) {
    c.status(400);
    return c.text("Invalid id", 401);
  }

  const cuidId = parseCuid.data;

  await db.execute({
    sql: `DELETE FROM todosV2 WHERE id = ?`,
    args: [cuidId],
  });
  return c.html(html`<div />`);
});

app.fire();
