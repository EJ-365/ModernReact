import TodoItem from "./TodoItem";
export default function TodoList({ todos }) {
  return (
    <ul className="mt-6">
      {todos.map((todo) => (
        <TodoItem todo={todo} key={todo.id} />
      ))}
    </ul>
  );
}
