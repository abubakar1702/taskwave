import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaList, FaRegClock } from "react-icons/fa6";
import Avatar from "../../common/Avatar";

const ProjectTasks = ({ projectId, tasks = [] }) => {
  const navigate = useNavigate();

  const getStatusClass = (status) =>
    `status-${status?.toLowerCase().replace(" ", "") || "default"}`;

  const getPriorityClass = (priority) =>
    `priority-${priority?.toLowerCase() || "default"}`;

  const getDueDateClass = (dueDate) => {
    if (!dueDate) return "";

    const today = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return "due-overdue";
    if (daysDiff <= 7) return "due-upcoming";

    return "";
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const aPriority = priorityOrder[a.priority?.toLowerCase()] || 1;
    const bPriority = priorityOrder[b.priority?.toLowerCase()] || 1;

    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const displayTasks = sortedTasks.slice(0, 5);
  const remainingTasksCount = Math.max(0, tasks.length - 5);

  const handleViewAllTasks = () => {
    navigate(`/project/${projectId}/tasks`);
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FaList className="w-5 h-5" />
          Tasks (0)
        </h2>
        <div className="text-center py-8">
          <FaList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            No tasks have been created for this project yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaList className="w-5 h-5" />
          Tasks ({tasks.length})
        </h2>
        {tasks.length > 10 && (
          <button
            onClick={handleViewAllTasks}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
          >
            View All
            <FaArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task.id)}
            className="group p-2 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors truncate">
                  {task.title}
                </h3>
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {task.creator && (
                    <span className="badge-creator flex items-center gap-1">
                      <Avatar
                        name={task.creator.first_name}
                        url={task.creator.avatar}
                        size={4}
                      />{" "}
                      {task.creator.first_name} {task.creator.last_name}
                    </span>
                  )}
                  {task.due_date && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium border ${getDueDateClass(
                        task.due_date
                      )} flex items-center gap-1`}
                    >
                      <FaRegClock className="w-3 h-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  )}
                  {task.priority && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  )}
                  {task.status && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {remainingTasksCount > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleViewAllTasks}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-700 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-sm"
          >
            Show {remainingTasksCount} more task
            {remainingTasksCount !== 1 ? "s" : ""}
            <FaArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;
