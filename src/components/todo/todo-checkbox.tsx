import { Todo } from "../../drizzle/types";

export function TodoCheckbox({ completed, id }: Todo) {
  return (
    <input
      class="w-5 h-5 p-2"
      type="checkbox"
      checked={!!completed}
      hx-post={`/todos/toggle/${id}`}
      hx-swap="outerHTML"
      hx-indicator="#spinner"
    />
  );
}
