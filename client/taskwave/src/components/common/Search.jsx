// src/components/common/Search.jsx
import React, { useState, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import { useApi } from "../../hooks/useApi";

const Search = ({
  endpoint,
  placeholder = "Search...",
  exclude = [],
  onSelect,
  renderItem,
}) => {
  const { request } = useApi();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await request("GET", `${endpoint}?q=${query}`);
        // Exclude already assigned users
        const filtered = data.filter(
          (user) => !exclude.some((ex) => ex.id === user.id)
        );
        setResults(filtered);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query, endpoint, exclude, request]);

  return (
    <div className="relative w-full">
      <div className="flex items-center border rounded-lg px-3 py-2">
        <FiSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full outline-none text-sm"
        />
      </div>

      {query && (
        <div className="absolute z-10 bg-white shadow-md rounded-md mt-1 w-full max-h-60 overflow-y-auto border border-gray-200">
          {loading ? (
            <div className="p-3 text-gray-500 text-sm">Searching...</div>
          ) : results.length > 0 ? (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  setQuery(""); // clear after selection
                  setResults([]);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer flex items-center space-x-2"
              >
                {renderItem ? renderItem(item) : <span>{item.name}</span>}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-sm">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
