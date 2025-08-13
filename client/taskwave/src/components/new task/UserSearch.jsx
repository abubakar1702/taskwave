import React, { useState, useEffect, useRef } from "react";
import { FiUser, FiX, FiSearch, FiChevronDown, FiAlertCircle } from "react-icons/fi";

const UserSearch = ({
  selectedUsers = [],
  onSelectUser,
  onRemoveUser,
  projectId = null,
  placeholder = "Search by using email or username...",
  disabled = false,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setAvailableUsers([]);
        return;
      }

      setLoading(true);
      try {
        const token =
          localStorage.getItem("accessToken") ||
          sessionStorage.getItem("accessToken");
        const response = await fetch(
          `http://127.0.0.1:8000/api/users/search/?q=${encodeURIComponent(
            searchQuery
          )}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.ok) {
          const { results } = await response.json();
          // Filter out already selected users
          const filteredResults = results.filter(
            (user) => !selectedUsers.some((selected) => selected.id === user.id)
          );
          setAvailableUsers(filteredResults);
        } else {
          console.error("Failed to search users");
          setAvailableUsers([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setAvailableUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedUsers]);

  const handleSelectUser = (user) => {
    onSelectUser(user);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const renderAvatar = (user) => {
    if (user?.avatar_url) {
      return (
        <img
          src={user.avatar_url}
          alt={user.username}
          className="w-6 h-6 rounded-full border border-white shadow object-cover"
        />
      );
    }
    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";
    return (
      <div className="w-6 h-6 rounded-full border border-white shadow bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
        {initial}
      </div>
    );
  };

  return (
    <div className="space-y-4 relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          ) : (
            <FiSearch className="h-5 w-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsDropdownOpen(true)}
          disabled={disabled}
          className={`block w-full pl-10 pr-3 py-3 border ${
            error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
          } rounded-lg leading-5 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm hover:bg-white`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          disabled={disabled}
        >
          <FiChevronDown
            className={`h-5 w-5 text-gray-400 transition-transform ${
              isDropdownOpen ? "transform rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <FiAlertCircle className="mr-1" />
          {error}
        </p>
      )}

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-y-auto focus:outline-none sm:text-sm">
          {availableUsers.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">
              {loading ? "Searching..." : "No team members found"}
            </div>
          ) : (
            availableUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectUser(user)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
              >
                {renderAvatar(user)}
                <div className="flex flex-col">
                  <span className="font-medium">
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </span>
                  <span className="text-sm text-gray-500">{user.email}</span>
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              {renderAvatar(user)}
              <span className="ml-1">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
              </span>
              <button
                type="button"
                onClick={() => onRemoveUser(user.id)}
                className="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 hover:bg-blue-200 focus:outline-none"
                disabled={disabled}
              >
                <FiX className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSearch;