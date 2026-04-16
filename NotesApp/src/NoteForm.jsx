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
  handleAddNote
}) => {
  return (
    <form className="mx-auto  md:text-left text-center md:grid md:grid-cols-3 flex flex-col gap-4 max-w-4xl mt-12 justify-center">
      {/* title input */}
      <div className="flex md:flex-col gap-2 md:ml-0 ml-40">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <input
          value={titleInput}
          onChange={handleTitle}
          placeholder="Enter note title...."
          id="title"
          name="title"
          type="text"
          className="rounded border px-3 py-1 w-full"
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
          className="rounded border px-3 py-1 w-full cursor-pointer"
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
          className="rounded border px-3 py-1 w-full cursor-pointer"
        >
             <option value="choose" className=" bg-zinc-600 text-gray-400 italic text-sm" >
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
            Description
          </label>
          <textarea
          required
            value={desc}
            onChange={handleDesc}
            id="description"
            name="description"
            className="border rounded px-3 py-1 w-full"
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
