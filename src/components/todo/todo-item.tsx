import { Todo } from "../../zod";
import { TodoCheckbox } from "./todo-checkbox";

export function TodoItem(todo: Todo) {
  const { content, id } = todo;
  const i = `todo-${id}`;
  return (
    <div class="flex flex-row space-x-8 border-b py-3" id={i}>
      <p class="flex-1 min-w-200 overflow-hidden text-ellipsis">{content}</p>
      <div class="flex flex-row items-center space-x-3 px-2">
        <TodoCheckbox {...todo} />
        <div class="flex">
          <button
            class="text-red-500 bg-red-50 p-1 rounded-md text-sm aspect-square font-bold flex items-center justify-center "
            hx-delete={`/todos/${id}`}
            hx-swap="outerHTML"
            hx-target={`#${i}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-4 h-4"
            >
              <path
                fill-rule="evenodd"
                d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
