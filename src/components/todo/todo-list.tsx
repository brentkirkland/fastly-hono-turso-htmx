import { Todos } from "../../zod";
import { TodoForm } from "./todo-form";
import { TodoItem } from "./todo-item";

export function TodoList({ todos }: { todos: Todos }) {
  return (
    <div>
      {todos.map((todo) => (
        <TodoItem {...todo} />
      ))}
      <TodoForm />
    </div>
  );
}
