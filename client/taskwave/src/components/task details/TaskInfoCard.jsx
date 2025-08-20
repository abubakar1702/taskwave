import React, { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import {
  HiOutlineCalendar,
  HiOutlineFolderOpen,
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineDotsVertical,
} from "react-icons/hi";
import { HiOutlineArrowLeftStartOnRectangle } from "react-icons/hi2";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { leaveTask } from "../../features/task detail/taskDetailSlice";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "../modals/ConfirmationModal";

const TaskInfoCard = ({ task, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const { currentUser } = useCurrentUser();
  const taskData = useAppSelector((state) => state.taskDetail.task);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "in progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit();
    setIsDropdownOpen(false);
  };

  const handleLeaveTask = async () => {
    if (!currentUser || !taskData) return;

    try {
      await dispatch(
        leaveTask({
          taskId: taskData.id,
          userId: currentUser.id,
        })
      ).unwrap();

      toast.success("You have successfully left the task.");
      setIsDropdownOpen(false);
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to leave task:", error);
      toast.error("Failed to leave task. Please try again.");
    }
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
    setIsDropdownOpen(false);
  };

  const handleLeaveClick = () => {
    setIsDropdownOpen(false);
    setShowLeaveConfirmation(true);
  };

  const confirmLeave = () => {
    handleLeaveTask();
    setShowLeaveConfirmation(false);
  };

  const cancelLeave = () => {
    setShowLeaveConfirmation(false);
  };

  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status?.toLowerCase() !== "completed";

  const isCurrentUserAssignee = taskData?.assignees?.some(
    (assignee) => assignee.id === currentUser?.id
  );

  const isCurrentUserCreator = taskData?.creator?.id === currentUser?.id;

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 break-words">
              {task.title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                  task.status
                )}`}
              >
                {task.status}
              </span>
              <span
                className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority} Priority
              </span>
              {task.project?.title && (
                <span className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-indigo-200 text-indigo-600 bg-indigo-50">
                  <HiOutlineFolderOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-none">
                    {task.project?.title}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative flex-shrink-0">
            <button
              ref={buttonRef}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              aria-label="Task actions"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              <HiOutlineDotsVertical className="w-5 h-5" />
            </button>

            {isDropdownOpen && (
              <>
                {/* Mobile backdrop */}
                <div
                  className="fixed inset-0 z-10 sm:hidden"
                  onClick={() => setIsDropdownOpen(false)}
                />

                {/* Dropdown Menu */}
                <div
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 transform origin-top-right"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {isCurrentUserCreator && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      role="menuitem"
                    >
                      <HiOutlinePencilAlt className="w-4 h-4 text-gray-500" />
                      Edit Task
                    </button>
                  )}

                  <hr className="border-gray-100" />

                  {isCurrentUserAssignee && !isCurrentUserCreator && (
                    <>
                      <button
                        onClick={handleLeaveClick}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 transition-colors text-left"
                        role="menuitem"
                      >
                        <HiOutlineArrowLeftStartOnRectangle className="w-4 h-4 text-blue-500" />
                        Leave Task
                      </button>
                      <hr className="border-gray-100" />
                    </>
                  )}
                  {isCurrentUserCreator && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      role="menuitem"
                    >
                      <HiOutlineTrash className="w-4 h-4 text-red-500" />
                      Delete Task
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base break-words">
              {task.description}
            </p>
          </div>
        )}

        {/* Due Date */}
        {(task.due_date || task.due_time) && (
          <div
            className={`p-3 sm:p-4 rounded-lg border flex items-center gap-2 ${
              isOverdue
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <HiOutlineCalendar
              className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${
                isOverdue ? "text-red-500" : "text-blue-500"
              }`}
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
              <span
                className={`text-xs sm:text-sm font-medium ${
                  isOverdue ? "text-red-700" : "text-blue-700"
                }`}
              >
                {isOverdue ? "Overdue" : "Due"}:
              </span>
              {task.due_date && (
                <span
                  className={`text-xs sm:text-sm font-semibold break-all ${
                    isOverdue ? "text-red-800" : "text-blue-800"
                  }`}
                >
                  {format(new Date(task.due_date), "MMMM dd, yyyy")}
                  {task.due_time &&
                    ` at ${format(
                      new Date(`1970-01-01T${task.due_time}`),
                      "HH:mm"
                    )}`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-auto justify-end items-start sm:items-center pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            Last Updated:{" "}
            <span className="font-medium text-gray-600">
              {format(new Date(task.updated_at), "MMM dd, yyyy 'at' HH:mm")}
            </span>
          </span>
          <span className="text-xs text-gray-500">
            Created:{" "}
            <span className="font-medium text-gray-600">
              {format(new Date(task.created_at), "MMM dd, yyyy 'at' HH:mm")}
            </span>
          </span>
        </div>
      </div>

      {/* Leave Task Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLeaveConfirmation}
        title="Leave Task"
        message="Are you sure you want to leave this task? You will no longer be assigned to it."
        confirmText="Leave Task"
        loadingText="Leaving..."
        successMessage="You have successfully left the task."
        errorMessage="Failed to leave task. Please try again."
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
};

export default TaskInfoCard;
