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
        class="border border-gray-400 w-full rounded-sm p-2"
        placeholder="Add a todo"
      />
      <button
        type="submit"
        class="bg-teal-500 text-white px-6 text-sm font-bold rounded-sm "
      >
        Add
      </button>
    </form>
  );
}
