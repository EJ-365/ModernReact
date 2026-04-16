import { useEffect, useState } from "react";
import NotesForm from "./NoteForm";

const Notes = () => {
  const [showAddNewNote, setShowAddNewNote] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [desc, setDesc] = useState("");
  const [prioritySelect, setPrioritySelect] = useState("medium");
  const [categorySelect, setCategorySelect] = useState("");

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem("MyNote");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            title: "Learn react",
            priority: "high",
            category: "personal",
            desc: "this is a sample note",
            done: false,
          },
        ];
  });

  // handle add new note button
  const handleAddNewNote = () => {
    setShowAddNewNote((prev) => !prev);
  };

  // handle title input
  const handleTitle = (e) => {
    setTitleInput(e.target.value);
  };

  // handle description input
  const handleDesc = (e) => {
    setDesc(e.target.value);
  };

  // handle priority select
  const handlePrioritySelect = (e) => {
    setPrioritySelect(e.target.value);
  };

  // handle category select
  const handleCategorySelect = (e) => {
    if (e.target.value === "choose") return;
    setCategorySelect(e.target.value);
  };

  // handle add note button: add the notes to the list
  const handleAddNote = (e) => {
    e.preventDefault();
    if (!desc.trim() || !titleInput.trim()) return;
    setNotes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: titleInput,
        priority: prioritySelect,
        category: categorySelect,
        desc,
        done: false,
        color: randomColor(),
      },
    ]);
    setTitleInput("");
    setDesc("");
  };

  // handle Delete notes
  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  };

  // handle toggle function
  const handleToggle = (id) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, done: !note.done } : note,
      ),
    );
  };

  // random color for border color
  const randomColor = () => {
    const colors = [
      "red",
      "blue",
      "orange",
      "purple",
      "green",
      "yellow",
      "pink",
      "indigo",
      "teal",
      "cyan",
      "lime",
      "emerald",
    ];
    const rand = Math.floor(Math.random() * colors.length);
    return colors[rand];
  };

  // useEffect for local storage
  useEffect(() => {
    localStorage.setItem("MyNote", JSON.stringify(notes));
  }, [notes]);

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

      {/* displaying add new note form here */}
      {showAddNewNote && (
        <NotesForm
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
        {notes.map((note) => (
          <li
            key={note.id}
            className={`border-t-6 border-t-gray-50/50 pr-10 pl-8 py-3 w-120 rounded-xl shadow-lg border-l-4 mb-2 ${note.done ? "bg-gray-200" : ""}`}
            style={{ borderLeftColor: note.color }}
          >
            <h2 className="capitalize font-bold text-xl">{note.title}</h2>
            <p className="text-gray-700 font-bold capitalize">
              Category: <span className="font-normal">{note.category}</span>
            </p>
            <p className="text-gray-700 font-bold capitalize">
              Priority: <span className="font-normal">{note.priority}</span>
            </p>
            <p className="my-3">{note.desc}</p>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button
                onClick={() => handleDelete(note.id)}
                className="text-red-500 font-semibold hover:bg-red-100 pr-3 pl-2 rounded-md py-1 cursor-pointer"
              >
                🗑️Delete
              </button>

              <div className="">
                <input
                  checked={note.done}
                  onChange={() => handleToggle(note.id)}
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
    </main>
  );
};

export default Notes;
