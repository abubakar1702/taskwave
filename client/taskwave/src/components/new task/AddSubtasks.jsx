import React, { useState } from "react";
import { FiFileText, FiX, FiAlertCircle } from "react-icons/fi";
import { FaPlus } from "react-icons/fa";

const AddSubtasks = ({
  subtasks,
  onAddSubtask,
  onRemoveSubtask,
  onUpdateSubtask,
  onRemoveSubtaskAssignee,
  assignedUsers,
  validationErrors,
}) => {
  const [newSubtask, setNewSubtask] = useState("");
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState("");

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) {
      return;
    }
    const selectedUserId = newSubtaskAssignee;
    const selectedUser = selectedUserId
      ? assignedUsers.find((user) => user.id === selectedUserId)
      : null;

    onAddSubtask({
      title: newSubtask.trim(),
      assigned_to: selectedUser || null,
      is_completed: false,
    });

    setNewSubtask("");
    setNewSubtaskAssignee("");
  };

  const renderAssigneeAvatar = (user) => {
    if (!user) return null;

    return user.avatar ? (
      <img
        src={user.avatar}
        alt={user.username}
        className="w-6 h-6 rounded-full border border-white shadow object-cover"
      />
    ) : (
      <div className="w-6 h-6 rounded-full border border-white shadow bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
        {user.first_name?.[0]?.toUpperCase() ||
          user.username?.[0]?.toUpperCase() ||
          "U"}
      </div>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FiFileText className="text-purple-400" /> Subtasks
      </h3>
      <div className="space-y-4">
        {subtasks.map((subtask, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <FiFileText className="text-purple-400" /> Subtask {index + 1}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) =>
                      onUpdateSubtask(index, {
                        ...subtask,
                        title: e.target.value,
                      })
                    }
                    className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      validationErrors[`subtask_${index}`]
                        ? "border-red-300 focus:ring-red-500 bg-red-50"
                        : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-white"
                    }`}
                    placeholder="Subtask description"
                  />
                </div>
                {validationErrors[`subtask_${index}`] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FiAlertCircle className="mr-1" />
                    {validationErrors[`subtask_${index}`]}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onRemoveSubtask(index)}
                className="ml-3 inline-flex items-center p-1 border border-transparent rounded-full text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>

            {subtask.assigned_to && (
              <div className="mt-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {renderAssigneeAvatar(subtask.assigned_to)}
                  <span className="ml-1">
                    {subtask.assigned_to.first_name &&
                    subtask.assigned_to.last_name
                      ? `${subtask.assigned_to.first_name} ${subtask.assigned_to.last_name}`
                      : subtask.assigned_to.username}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveSubtaskAssignee(index)}
                    className="ml-1.5 inline-flex items-center justify-center rounded-full h-4 w-4 hover:bg-blue-200 focus:outline-none"
                  >
                    <FiX className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <label htmlFor="newSubtask" className="sr-only">
                Add subtask
              </label>
              <FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                id="newSubtask"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddSubtask())
                }
                className={`pl-10 pr-4 py-3 w-full border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  validationErrors.newSubtask
                    ? "border-red-300 focus:ring-red-500 bg-red-50"
                    : "border-gray-200 focus:ring-blue-500 focus:border-transparent bg-white"
                }`}
                placeholder="Add a new subtask"
              />
            </div>
            <button
              type="button"
              onClick={handleAddSubtask}
              className="inline-flex items-center px-4 py-3 border border-transparent text-sm leading-4 font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPlus className="mr-2" /> Add
            </button>
          </div>

          {validationErrors.newSubtask && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <FiAlertCircle className="mr-1" />
              {validationErrors.newSubtask}
            </p>
          )}

          {assignedUsers.length > 0 && (
            <div className="mt-3">
              <select
                value={newSubtaskAssignee}
                onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white"
              >
                <option value="">Assign to (optional)</option>
                {assignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.username}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSubtasks;
