import React, { useEffect, useRef, useState, useCallback } from "react";
import { FiSearch, FiAlertCircle, FiX } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import UserInitial from "../auth/UserInitial";
import { useApi } from "../../hooks/useApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const UserSearch = ({
  selectedUsers = [],
  onSelectUser,
  onRemoveUser,
  projectId = null,
  placeholder = "Search using email...",
  error = null,
  disabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentAssignees, setCurrentAssignees] = useState([]);

  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUrl =
    debouncedQuery.length >= 3
      ? `${API_BASE_URL}/api/users/search/?q=${encodeURIComponent(
          debouncedQuery
        )}${projectId ? `&project_id=${projectId}` : ""}`
      : null;

  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
  } = useApi(searchUrl, "GET", null, [debouncedQuery, projectId]);

  const availableUsers = searchData?.results || searchData || [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setIsDropdownOpen(false);
  }, []);

  const handleSelect = useCallback(
    (user) => {
      if (onSelectUser) {
        onSelectUser(user);
      }
      setSearchQuery("");
      setIsDropdownOpen(false);
    },
    [onSelectUser]
  );

  const handleRemove = useCallback(
    (userId) => {
      if (onRemoveUser) {
        onRemoveUser(userId);
      }
    },
    [onRemoveUser]
  );

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const filteredUsers = availableUsers.filter(
    (user) => !selectedUsers.some((selectedUser) => selectedUser.id === user.id)
  );

  const getUserDisplayName = (user) =>
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.first_name;

  const getAvatarUrl = (user) => {
    if (!user.avatar) return null;
    const isAbsolute = user.avatar.startsWith("http");
    return isAbsolute ? user.avatar : `${API_BASE_URL}${user.avatar}`;
  };

  const displayError = error || searchError;

  return (
    <div className="space-y-4">
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={placeholder}
            className="block w-full pl-10 pr-10 py-3 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
            autoComplete="off"
          />

          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled}
            aria-label="Toggle dropdown"
          >
            <ClipLoader size={16} color="#9CA3AF" loading={searchLoading} />
          </button>
        </div>

        {displayError && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <FiAlertCircle className="mr-1 h-4 w-4" />
            {typeof displayError === "object"
              ? displayError.message || "Failed to search users"
              : displayError}
          </p>
        )}

        {/* Dropdown */}
        {isDropdownOpen && searchQuery.trim().length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 overflow-y-auto border border-gray-200 sm:text-sm">
            {searchQuery.length < 3 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                Type at least 3 characters to search
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                {searchLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  "No team members found"
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center space-x-3 transition-colors focus:bg-gray-100 focus:outline-none"
                  disabled={disabled}
                >
                  {getAvatarUrl(user) ? (
                    <img
                      src={getAvatarUrl(user)}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <UserInitial
                      user={user.first_name || user.username}
                      className="w-8 h-8 text-sm"
                    />
                  )}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium truncate text-gray-900">
                      {getUserDisplayName(user)}
                    </span>
                    <span className="text-sm text-gray-500 truncate">
                      {user.email}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Selected Users Display */}
      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Selected Team Members ({selectedUsers.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm"
              >
                {getAvatarUrl(user) ? (
                  <img
                    src={getAvatarUrl(user)}
                    alt={user.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <UserInitial
                    user={user.first_name || user.username}
                    className="w-6 h-6 text-xs"
                  />
                )}
                <span className="font-medium">{getUserDisplayName(user)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(user.id)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  disabled={disabled}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
