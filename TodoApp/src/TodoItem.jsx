export default function TodoItem({ todo }) {
  return (
   <li className="flex items-center justify-between p-2 border-b border-gray-100 my-2">
  <div className="flex items-center gap-3">
    <input type="checkbox" className="cursor-pointer" />
    <h3 className="text-gray-800 font-medium">{todo.title}</h3>
  </div>

  <div className="flex items-center text-gray-400 hover:text-red-500 cursor-pointer transition-colors">
    <i className="bx bx-x text-2xl"></i>
  </div>
</li>

  );
}
