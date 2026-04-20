import AddNoteBtn from "./AddNoteBtn";
const NotesForm = ({
  titleInput,
  handleTitle,
  desc,
  handleDesc,
  prioritySelect,
  handlePrioritySelect,
  categorySelect,
  handleCategorySelect,
  handleAddNote,
  emptyInput
}) => {
  

  // UI Start here
  return (
    <form className="mx-auto  md:text-left text-center md:grid md:grid-cols-3 flex flex-col gap-4 max-w-4xl mt-12 justify-center">
      {/* title input */}
      <div className="flex md:flex-col gap-2 md:ml-0 ml-40">
        <label htmlFor="title" className="text-sm font-medium">
          Title <span  className="text-red-500 text-lg">*</span>
        </label>
        <input
          value={titleInput}
          onChange={handleTitle}
          placeholder="Enter note title...."
          id="title"
          name="title"
          type="text"
          className={` outline-1 focus:ring-2 focus:ring-purple-800 outline-gray-500 ${emptyInput && " text-gray-700  focus:ring-red-500 border-red-500 border-2 outline-none"} rounded border px-3 py-1 w-full`}
        />
      </div>

      {/* priority select */}
      <div className="flex md:flex-col gap-2 md:ml-0 ml-40">
        <label htmlFor="priority" className="text-sm font-medium">
          Priority
        </label>
        <select
          value={prioritySelect}
          onChange={handlePrioritySelect}
          id="priority"
          name="priority"
          className={`rounded border px-3 py-1 w-full cursor-pointer outline-1 focus:ring-2 focus:ring-purple-800 outline-gray-500`}
        >
          <option value="high" className=" bg-zinc-600 text-white">
            High &#128308;
          </option>
          <option value="medium" className=" bg-zinc-600 text-white">
            Medium &#128992;
          </option>
          <option value="low" className=" bg-zinc-600 text-white">
            Low &#128994;
          </option>
        </select>
      </div>

      {/* Category */}
      <div className="flex md:flex-col gap-2 md:ml-0 ml-40">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <select
          value={categorySelect}
          onChange={handleCategorySelect}
          id="category"
          name="category"
          className={`rounded border px-3 py-1 w-full cursor-pointer outline-1 focus:ring-2 focus:ring-purple-800 outline-gray-500`}
        >
          <option
            value="choose"
            className=" bg-zinc-600 text-gray-400 italic text-sm"
          >
            _______Choose a category_________ 👇🏽
          </option>
          <option value="work" className=" bg-zinc-600 text-white">
            Work 📂
          </option>
          <option value="personal" className=" bg-zinc-600 text-white">
            Personal 💻
          </option>
          <option value="ideas" className=" bg-zinc-600 text-white">
            Ideas 💡
          </option>
        </select>
      </div>

      {/* description */}
      <div className="col-span-3 flex justify-center">
        <div className="w-full max-w-md flex md:flex-col gap-2 md:ml-0 ml-40">
          <label htmlFor="description" className="text-sm font-medium">
            Description <span  className="text-red-500 text-lg">*</span>
          </label>
          <textarea
            required
            value={desc}
            onChange={handleDesc}
            id="description"
            name="description"
            className={`border rounded px-3 py-1 w-full outline-1 focus:ring-2 focus:ring-purple-800 outline-gray-500 ${emptyInput && " text-gray-700  focus:ring-red-500 border-red-500 border-2 outline-none"} `}
            placeholder="Type something..."
          />
        </div>
      </div>
      {/* add note button */}
      <div className="col-span-3 flex justify-center">
        <AddNoteBtn handleAddNote={handleAddNote} />
      </div>
    </form>
  );
};

export default NotesForm;
