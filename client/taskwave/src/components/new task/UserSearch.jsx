import React, { useEffect, useRef, useState, useCallback } from "react";
import { FiSearch, FiAlertCircle } from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectUser } from "../../features/task detail/taskDetailSlice";
import UserInitial from "../auth/UserInitial";
import { useApi } from "../../hooks/useApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const UserSearch = ({ disabled = false }) => {
  const dispatch = useAppDispatch();
  const { items, task } = useAppSelector((state) => state.taskDetail);
  const [currentAssignees, setCurrentAssignees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const dropdownRef = useRef(null);
  const taskId = task?.id;

  let projectId = null;
  if (task?.project) {
    if (typeof task.project === "string") {
      projectId = task.project;
    } else if (task.project.id) {
      projectId = task.project.id;
    }
  }

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
    makeRequest,
  } = useApi(searchUrl, "GET", null, [debouncedQuery, projectId]);

  const assigneesUrl = taskId
    ? `${API_BASE_URL}/api/task/${taskId}/assignees/`
    : null;
  const {
    data: assigneesData,
    loading: assigneesLoading,
    error: assigneesError,
    refetch: refetchAssignees,
  } = useApi(assigneesUrl, "GET", null, [taskId]);

  useEffect(() => {
    if (assigneesData) {
      setCurrentAssignees(assigneesData || []);
    }
  }, [assigneesData]);

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
      dispatch(selectUser(user));
      setSearchQuery("");
      setIsDropdownOpen(false);
    },
    [dispatch]
  );

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleInputFocus = () => {
    if (searchQuery) setIsDropdownOpen(true);
  };

  const filteredUsers = availableUsers.filter(
    (user) =>
      !items.some((selectedUser) => selectedUser.id === user.id) &&
      !currentAssignees.some((assignee) => assignee.id === user.id)
  );

  const getUserDisplayName = (user) =>
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.username;

  const getAvatarUrl = (user) => {
    if (!user.avatar) return null;
    const isAbsolute = user.avatar.startsWith("http");
    return isAbsolute ? user.avatar : `${API_BASE_URL}${user.avatar}`;
  };

  const loading = searchLoading || assigneesLoading;

  const error = searchError || assigneesError;

  return (
    <div className="relative" ref={dropdownRef}>
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
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Search by name, email, or username..."
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
          <ClipLoader size={16} color="#9CA3AF" loading={loading} />
        </button>
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <FiAlertCircle className="mr-1 h-4 w-4" />
          {typeof error === "object"
            ? error.message || "Failed to search users"
            : error}
        </p>
      )}

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
  );
};

export default UserSearch;
