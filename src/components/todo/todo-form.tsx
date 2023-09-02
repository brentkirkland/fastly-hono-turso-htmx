export function TodoForm() {
  return (
    <form
      class="flex flex-row space-x-3"
      hx-post="/todos"
      hx-swap="beforeend"
      hx-target="#todo-list"
      _="on submit target.reset()"
    >
      <input
        type="text"
        name="content"
        class="w-full p-2 border border-gray-400 rounded-sm dark:bg-gray-800 dark:text-white"
        placeholder="Add a todo"
      />
      <button
        type="submit"
        class="px-6 text-sm font-bold text-white bg-teal-500 rounded-sm dark:bg-teal-600 dark:text-teal-50 hover:bg-teal-600 dark:hover:bg-teal-700"
      >
        Add
      </button>
    </form>
  );
}
