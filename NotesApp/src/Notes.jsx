import { useEffect, useReducer, useState } from "react";
import NotesForm from "./NoteForm";

// reducer function:
function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: crypto.randomUUID(),
          title: action.title,
          priority: action.priority,
          category: action.category,
          desc: action.desc,
          done: false,
          color: action.color,
          time: action.time,
        },
      ];
    case "DELETE":
      return state.filter((note) => note.id !== action.id);
    case "TOGGLE":
      return state.map((note) =>
        note.id === action.id ? { ...note, done: !note.done } : note,
      );
  }
}

// filter state object
const initialFilter = { filter: "all" };

function filterReducer(state, action) {
  switch (action.type) {
    case "ALL":
      return { ...state, filter: "all" };
    case "ACTIVE":
      return { ...state, filter: "active" };
    case "COMPLETED":
      return { ...state, filter: "completed" };
    default:
      state;
  }
}

const Notes = () => {
  const [showAddNewNote, setShowAddNewNote] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [desc, setDesc] = useState("");
  const [prioritySelect, setPrioritySelect] = useState("medium");
  const [categorySelect, setCategorySelect] = useState("N/A");
  const [emptyInput, setEmptyInput] = useState(false);
  // adding useReducer() hook to support the handle function
  const [filterState, filterDispatch] = useReducer(
    filterReducer,
    initialFilter,
  );
  const [notes, dispatch] = useReducer(reducer, [], () => {
    const saved = localStorage.getItem("MyNote");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Learn React JS",
            priority: "high",
            category: "personal",
            desc: "this is a sample note",
            done: false,
          },
        ];
  });

  // filtered logic implementation
  const filterNotes = notes.filter((note) => {
      if (filterState.filter === "completed") return note.done;
      if (filterState.filter === "active") return !note.done;
      return true;
  });

  // handle add new note button
  const handleAddNewNote = () => {
    setShowAddNewNote((prev) => !prev);
  };

  // handle title input
  const handleTitle = (e) => {
    const value = e.target.value;
    setTitleInput(value);
    if (value.trim() !== "") {
      setEmptyInput(false);
    }
  };

  // handle description input
  const handleDesc = (e) => {
    const value = e.target.value;
    setDesc(value);
    if (value.trim() !== "") {
      setEmptyInput(false);
    }
  };

  // handle priority select input
  const handlePrioritySelect = (e) => {
    setPrioritySelect(e.target.value);
  };

  // handle category select
  const handleCategorySelect = (e) => {
    if (e.target.value === "choose") return;
    setCategorySelect(e.target.value);
  };
  // time and date
  function timeAndDate() {
    const date =
      new Date().toLocaleDateString("en-US", {
        day: "numeric",
        year: "numeric",
        month: "short",
        weekday: "short",
      }) +
      " @ " +
      new Date().toLocaleTimeString();
    return date;
  }

  // handle add note button: add the notes to the list; dispatch will be here
  const handleAddNote = (e) => {
    e.preventDefault();
    if (titleInput.trim() === "") {
      setEmptyInput(true);
      return;
    }
    setEmptyInput(false);

    if (desc.trim() === "") {
      setEmptyInput(true);
      return;
    }
    dispatch({
      type: "ADD",
      title: titleInput,
      priority: prioritySelect,
      category: categorySelect,
      desc,
      color: randomColor(),
      time: timeAndDate(),
    });
    setTitleInput("");
    setDesc("");
    setPrioritySelect("medium");
    setCategorySelect("N/A");
    setEmptyInput(false);
  };

  // random color based on the selected category for the border color
  function randomColor() {
    const colors = ["red", "orange", "green"];
    if (prioritySelect === "high") return colors[0];
    if (prioritySelect === "medium") return colors[1];
    if (prioritySelect === "low") return colors[2];
  }

  // useEffect for local storage
  useEffect(() => {
    localStorage.setItem("MyNote", JSON.stringify(notes));
  }, [notes]);

  // const handleAddNote = () => dispatch({type: "ADD", title: titleInput})
  /*******************UI START ********************* */
  return (
    <main>
      {/* add new note button */}
      <div className="w-180 mx-auto text-center">
        <button
          onClick={handleAddNewNote}
          className="border px-10 py-1 w-1/2 capitalize font-normal text-purple-700 rounded-md hover:cursor-pointer hover:bg-purple-100 duration-300 transition-all"
        >
          {showAddNewNote ? "Hide Form ✖️" : " Add New Note ➕"}
        </button>
      </div>
      {/* filtered note section */}
      <div className="flex items-center space-x-6 justify-center my-8">
        <button
          onClick={() =>
            filterDispatch({
              type: "ALL",
            })
          }
          className=" capitalize font-bold px-8 bg-purple-200 shadow-sm cursor-pointer hover:bg-purple-300 duration-300 transition-all rounded-md py-1"
        >
          All
        </button>
        <button
          onClick={() =>
            filterDispatch({
              type: "COMPLETED",
            })
          }
          className="capitalize font-bold text-green-800  px-8 bg-purple-200 shadow-sm cursor-pointer hover:bg-purple-300 duration-300 transition-all rounded-md py-1"
        >
          Completed
        </button>
        <button
          onClick={() =>
            filterDispatch({
              type: "ACTIVE",
            })
          }
          className="capitalize font-bold text-red-600 px-8 bg-purple-200 shadow-sm cursor-pointer hover:bg-purple-300 duration-300 transition-all rounded-md py-1"
        >
          active
        </button>
      </div>

      {/* displaying add new note form here */}
      {showAddNewNote && (
        <NotesForm
          emptyInput={emptyInput}
          titleInput={titleInput}
          handleTitle={handleTitle}
          desc={desc}
          handleDesc={handleDesc}
          prioritySelect={prioritySelect}
          handlePrioritySelect={handlePrioritySelect}
          categorySelect={categorySelect}
          handleCategorySelect={handleCategorySelect}
          handleAddNote={handleAddNote}
        />
      )}

      {/* Notes item: to be display in the list */}
      <ul className="mx-auto my-8 flex flex-row flex-wrap items-center justify-center gap-4">
        {filterNotes.map((note) => (
          <li
            key={note.id}
            className={`border-t-6 border-t-gray-50/50 pr-10 pl-8 py-3 w-120 rounded-xl shadow-lg border-l-4 mb-2 ${note.done ? "bg-gray-200" : ""}`}
            style={{ borderLeftColor: note.color }}
          >
            <div className="justify-between flex items-center">
              <div>
                <h2 className="capitalize font-bold text-xl">{note.title}</h2>
              </div>
              <div>
                <small className="text-xs italic text-gray-400">
                  {note.time}
                </small>
              </div>
            </div>

            <p className="text-gray-700 font-bold capitalize">
              Category: <span className="font-normal">{note.category}</span>
            </p>
            <p className="text-gray-700 font-bold capitalize">
              Priority: <span className="font-normal">{note.priority}</span>
            </p>
            <p className="my-3">{note.desc}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => dispatch({ type: "DELETE", id: note.id })}
                className={` ${note.done ? "hover:bg-black/70 bg-gray-200" : "hover:bg-red-700/80 hover:text-white"} text-red-500 font-semibold border-[1.5px]  pr-3 pl-2 rounded-md py-1 cursor-pointer`}
              >
                🗑️Delete
              </button>

              <div className="">
                <input
                  checked={note.done}
                  onChange={() => dispatch({ type: "TOGGLE", id: note.id })}
                  type="checkbox"
                  className="w-4 h-4 cursor-pointer align-middle"
                />{" "}
                <span>Done</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {notes.length <= 0 && (
        <div>
          <p className="text-center mt-40 mb-3 italic text-amber-600 font-semibold">
            Click the button above to add note.
          </p>
          <p className="text-center italic text-amber-600 font-semibold text-6xl">
            💤
          </p>
        </div>
      )}

      {filterState.filter !== "all" && filterNotes.length === 0 && (
        <div>
          <p className="text-center mt-40 mb-3 italic text-amber-600 font-semibold">
           {filterState.filter === "completed" ? "No completed notes" : "No active notes"}
          </p>
          <p className="text-center italic text-amber-600 font-semibold text-6xl">
            💤
          </p>
        </div>
      )}
    </main>
  );
};

export default Notes;
