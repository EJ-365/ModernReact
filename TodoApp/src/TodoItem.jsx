export default function TodoItem({ todo, onDeleteTodo, onToggleTodo }) {
  // function that handle the deletion of the todo
  function handleDeleteClick() {
    onDeleteTodo(todo.id);
  }

  // function to toggle todo
  function handleToggleChange() {
    onToggleTodo(todo.id);
  }
  return (
    <li className="flex items-center justify-between p-2 border-b border-gray-100 my-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          className="cursor-pointer"
          onChange={handleToggleChange}
          checked={todo.completed}
        />
        <h3 className={`font-medium ${todo.completed ? "line-through text-gray-400" : "text-gray-800 "}`}>{todo.title}</h3>
      </div>

      <div className="flex items-center text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
        <i className="bx bx-x text-2xl" onClick={handleDeleteClick}></i>
      </div>
    </li>
  );
}
