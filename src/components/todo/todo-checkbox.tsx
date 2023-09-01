import { Todo } from "../../zod";

export function TodoCheckbox({ completed, id }: Todo) {
  return (
    <input
      class="p-2 w-5 h-5"
      type="checkbox"
      checked={!!completed}
      hx-post={`/todos/toggle/${id}`}
      hx-swap="outerHTML"
    />
  );
}
