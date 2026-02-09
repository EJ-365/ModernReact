import { Search } from "lucide-react";

export default function SearchForm() {
  return (
    <form className="relative flex-1 max-w-[180px] sm:max-w-md mx-2">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 bg-[#f1f5f9] border border-transparent rounded-3xl focus:bg-white focus:border-gray-300 outline-none transition-all text-sm"
        placeholder="Search recipes..."
      />
    </form>
  );
}
