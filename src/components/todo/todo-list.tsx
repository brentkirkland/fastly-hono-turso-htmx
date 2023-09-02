import { Todos } from "../../zod";
import { TodoForm } from "./todo-form";
import { TodoItem } from "./todo-item";

export function TodoList({ todos }: { todos: Todos }) {
  return (
    <div class="p-4">
      <h1 class="pt-2 pb-4 text-2xl font-bold border-b">Todos</h1>
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
