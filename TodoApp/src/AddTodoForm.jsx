export default function AddTodoForm() {
  // handle submit function
  function handleSubmit(e) {
    e.preventDefault();
  }

  return (
    <form className="flex items-center justify-between" onSubmit={handleSubmit}>
      {/*input area */}
      <div>
        <input
          type="text"
          className=" w-96 border p-2 rounded-lg border-gray-400 shadow-xs placeholder:px-2  placeholder:text-slate-400 focus:outline-0 focus:border-gray-700 focus:ring-1 focus:ring-indigo-200"
          placeholder="Add a new todo..."
        />
      </div>

      {/* Button */}
      <div className="text-white my-auto w-">
        <button className="bg-indigo-700 px-8 py-2 rounded-xl font-semibold cursor-pointer transition duration-300 hover:bg-indigo-800 ease-in-out">
          Add
        </button>
      </div>
    </form>
  );
}
