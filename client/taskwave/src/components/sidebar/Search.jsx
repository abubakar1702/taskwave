import React from "react";
import { IoSearchOutline } from "react-icons/io5";

const Search = ({ collapsed }) => {
  return (
    <div className="relative">
      {collapsed ? (
        <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
          <IoSearchOutline className="text-xl text-gray-500" />
        </button>
      ) : (
        <div className="relative border border-gray-200 rounded-lg">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-3 py-2 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <IoSearchOutline className="absolute right-3 top-2 text-gray-400" />
        </div>
      )}
    </div>
  );
};

export default Search;
