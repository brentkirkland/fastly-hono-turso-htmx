import { InferModel } from "drizzle-orm";
import { todos } from "./schema";

export type Todo = InferModel<typeof todos>;
