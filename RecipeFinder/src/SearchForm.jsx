import { Search } from "lucide-react";
export default function SearchForm({query, setQuery, handleSubmit}) {
  return (
    <form className="relative flex-1 max-w-[180px] sm:max-w-md mx-2" onSubmit={handleSubmit}>
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
        type="text"
        className="w-full pl-10 pr-4 py-2 bg-[#f1f5f9] border border-gray-200 rounded-3xl focus:bg-white focus:border-gray-400 outline-none  transition-all text-sm"
        placeholder="Search recipes..."
      />
    </form>
  );
}
