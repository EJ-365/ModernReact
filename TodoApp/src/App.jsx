import AddTodoForm from "./AddTodoForm";
import TodoList from "./TodoList";
import Footer from "./Footer";
import { useState } from "react";

function App() {
  // filter state: all, active, and completed
  const [filter, setFilter] = useState("all");

  // todos state:
  const [todos, setTodos] = useState([
    { id: 1, title: "Finish project proposal", completed: false },
    { id: 2, title: "Schedule team meeting", completed: false },
    { id: 3, title: "Buy groceries", completed: true },
  ]);

  // visibile todo: for the filter states to determine which one is done or not
  const visibileTodos =
    filter === "active"
      ? todos.filter((todo) => !todo.completed)
      : filter === "completed"
        ? todos.filter((todo) => todo.completed)
        : todos;

  // calculating items left/todos left
  const itemsLeft = todos.filter((todo) => !todo.completed).length;

  // handle add to do
  function handleAddTodo(title) {
    setTodos((prevTodos) => [
      ...prevTodos,
      { id: Date.now(), title, completed: false },
    ]);
  }

  // Deleting todo: onDeleteTodo function
  function handleDeleteTodo(id) {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  }

  // handleToggleTodo: the function that actually handle the functionality of input check toggle
  function handleToggleTodo(id) {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  // clear completed button
  function handleClearCompleted() {
    setTodos((prevTodos) => prevTodos.filter((todo) => !todo.completed));
  }

  return (
    <main className="w-full h-screen  flex items-center justify-center bg-gray-100 md:p-0 p-4">
      <div className=" w-auto bg-white p-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.15)] ">
        {/* Title: My Todo */}
        <div>
          <h1 className="font-bold text-2xl">My Todos</h1>
          <p className="text-sm text-gray-700 mt-1">Stay organized</p>
        </div>

        {/* filter selection */}
        <div className="my-6 capitalize flex items-center justify-between md:justify-start mx-2 space-x-2 md:space-x-8 bg-slate-200 px-2 py-1 rounded-xl overflow-x-auto">
          <button
            className={`duration-300 ease-in-out transition cursor-pointer font-medium text-xs py-1.5 px-6 md:px-12 ${filter === "all" ? " text-indigo-600 bg-white shadow-sm rounded-sm   hover:bg-gray-50 duration-300 ease-in-out transition" : "cursor-pointer font-medium text-xs py-1.5 px-6 md:px-12 text-gray-600"}`}
            onClick={() => setFilter("all")}
          >
            {" "}
            All{" "}
          </button>

          <button
            className={`duration-300 ease-in-out transition cursor-pointer font-medium text-xs py-1.5 px-6 md:px-12 ${filter === "active" ? " text-indigo-600 bg-white shadow-sm rounded-sm   hover:bg-gray-50 duration-300 ease-in-out transition" : "cursor-pointer font-medium text-xs py-1.5 px-6 md:px-12 text-gray-600"}`}
            onClick={() => setFilter("active")}
          >
            {" "}
            Active{" "}
          </button>

          <button
            className={`duration-300 ease-in-out transition cursor-pointer font-medium text-xs py-1.5 px-6 md:px-12 ${filter === "completed" ? " text-indigo-600 bg-white shadow-sm rounded-sm   hover:bg-gray-50 duration-300 ease-in-out transition" : "cursor-pointer font-medium text-xs py-1.5 px-6 md:px-12 text-gray-600"}`}
            onClick={() => setFilter("completed")}
          >
            {" "}
            Completed{" "}
          </button>
        </div>

        {/*form component */}
        <AddTodoForm onAddTodo={handleAddTodo} />

        {/*Todo List UI */}
        <TodoList
          todos={visibileTodos}
          onDeleteTodo={handleDeleteTodo}
          onToggleTodo={handleToggleTodo}
        />
        <div className="flex items-center justify-between mt-4 uppercase">
          <p className="text-gray-400 text-sm">{itemsLeft} items left</p>
          <button
            className="text-indigo-400 text-sm uppercase cursor-pointer hover:text-indigo-300 font-medium"
            onClick={handleClearCompleted}
          >
            Clear completed
          </button>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}

/**************************DO NOT ENTER************** */
export default App;
