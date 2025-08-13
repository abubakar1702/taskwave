import React from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import {
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlineUser,
  HiOutlineClock,
} from "react-icons/hi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Subtasks = ({ task, setTask }) => {
  const getAccessToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const toggleSubtaskCompletion = async (subtaskId, currentStatus, taskId) => {
    try {
      const accessToken = getAccessToken();

      const response = await fetch(
        `${API_BASE_URL}/api/tasks/${taskId}/subtask/${subtaskId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            is_completed: !currentStatus,
          }),
        }
      );

      if (response.ok) {
        setTask((prevTask) => ({
          ...prevTask,
          subtasks: prevTask.subtasks.map((subtask) =>
            subtask.id === subtaskId
              ? { ...subtask, is_completed: !currentStatus }
              : subtask
          ),
        }));
        toast.success("Subtask updated successfully");
      } else {
        throw new Error("Failed to update subtask");
      }
    } catch (err) {
      toast.error("Failed to update subtask");
    }
  };

  const renderAvatar = (user) => {
    if (!user) return null;
    
    if (user.avatar) {
      const isAbsolute = user.avatar.startsWith("http");
      const avatarUrl = isAbsolute
        ? user.avatar
        : `${API_BASE_URL}${user.avatar}`;
      return (
        <img
          src={avatarUrl}
          alt={user.username}
          className="w-6 h-6 rounded-full border border-gray-200 object-cover"
        />
      );
    }

    const initial =
      user.first_name?.[0]?.toUpperCase() ||
      user.username?.[0]?.toUpperCase() ||
      "U";

    return (
      <div className="w-6 h-6 rounded-full border border-gray-200 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
        {initial}
      </div>
    );
  };

  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.is_completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progress =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Subtasks</h2>
        <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
          <HiOutlinePlus className="w-4 h-4" />
          Add Subtask
        </button>
      </div>

      {task.subtasks && task.subtasks.length > 0 ? (
        <>
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>
                {completedSubtasks} of {totalSubtasks} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <button
                  onClick={() =>
                    toggleSubtaskCompletion(
                      subtask.id,
                      subtask.is_completed,
                      task.id
                    )
                  }
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mt-0.5 ${
                    subtask.is_completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-green-500"
                  }`}
                >
                  {subtask.is_completed && (
                    <HiOutlineCheckCircle className="w-3 h-3" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium mb-2 ${
                      subtask.is_completed
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {subtask.title}
                  </h4>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    {/* Assignment Information */}
                    {subtask.assigned_to ? (
                      <div className="flex items-center gap-1.5">
                        {renderAvatar(subtask.assigned_to)}
                        <span>
                          <span className="font-medium text-gray-700">
                            {subtask.assigned_to.first_name ||
                            subtask.assigned_to.last_name
                              ? `${subtask.assigned_to.first_name} ${subtask.assigned_to.last_name}`.trim()
                              : subtask.assigned_to.username}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 flex items-center justify-center">
                          <HiOutlineUser className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className="text-gray-400 italic">Unassigned</span>
                      </div>
                    )}
                    
                    {/* Creation/Assignment Date */}
                    <div className="flex items-center gap-1.5">
                      <HiOutlineClock className="w-3 h-3 text-gray-400" />
                      <span>
                        Created{" "}
                        <span className="font-medium text-gray-700">
                          {format(new Date(subtask.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <HiOutlineCheckCircle className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">No subtasks available</p>
          <p className="text-sm text-gray-500 mt-1">
            Click the "Add Subtask" button to create one
          </p>
        </div>
      )}
    </div>
  );
};

export default Subtasks;