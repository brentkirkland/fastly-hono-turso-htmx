import { Todos } from "../../zod";
import { TodoForm } from "./todo-form";
import { TodoItem } from "./todo-item";

export function TodoList({ todos }: { todos: Todos }) {
  return (
    <div class="p-4">
      <h1 class="text-2xl font-bold border-b pb-4 pt-2">Todos</h1>
      <div class="space-y-4" id="todo-parent">
        <div id="todo-list" class="">
          {todos.map((todo) => (
            <TodoItem {...todo} />
          ))}
        </div>
        <TodoForm />
      </div>
    </div>
  );
}
