import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  completed: integer("completed").default(0).notNull(),
});
