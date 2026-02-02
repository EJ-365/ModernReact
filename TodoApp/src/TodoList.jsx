import TodoItem from "./TodoItem";
export default function TodoList({ todos, onDeleteTodo, onToggleTodo}) {
  return (
    <ul className="mt-6">
      {todos.map((todo) => (
        <TodoItem todo={todo} onDeleteTodo={onDeleteTodo} onToggleTodo={onToggleTodo}   key={todo.id} />
      ))}
    </ul>
  );
}
