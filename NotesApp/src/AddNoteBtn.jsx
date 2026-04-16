const AddNoteBtn = ({handleAddNote}) => {
    // handle add note

    /********************UI START HERE**************** */
  return (
    <div className="w-180 text-center mx-auto  items-center justify-center ml-20 flex-col col-span-3 flex mt-6">
        <button onClick={handleAddNote}  className="text-white border px-10 py-1 w-full capitalize font-normal  rounded-md hover:cursor-pointer hover:bg-purple-700 duration-300 transition-all bg-purple-600">
      Add Note
    </button>
    </div>
  );
};
export default AddNoteBtn;
