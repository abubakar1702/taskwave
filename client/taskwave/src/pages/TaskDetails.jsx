import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { ClipLoader } from "react-spinners";
import Subtasks from "../components/task details/Subtasks";
import AssigneesSection from "../components/task details/AssigneesSection";
import CreatorSection from "../components/task details/CreatorSection";
import AssetsSection from "../components/task details/AssetsSection";
import TaskInfoCard from "../components/task details/TaskInfoCard";
import EditTaskModal from "../components/update tasks/EditTaskModal";
import { useCurrentUser } from "../hooks/useCurrentUser";
import ConfirmationModal from "../components/modals/ConfirmationModal";
import { useApi } from "../hooks/useApi";

import { useAppDispatch, useAppSelector } from "../app/hooks";
import { fetchTaskDetail } from "../features/task detail/taskDetailSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const TaskDetails = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const dispatch = useAppDispatch();
  const { task, loading, error } = useAppSelector((state) => state.taskDetail);

  const { makeRequest } = useApi();

  useEffect(() => {
    if (id) {
      dispatch(fetchTaskDetail({ taskId: id }));
    }
  }, [dispatch, id]);

  const handleEditTask = () => setIsEditModalOpen(true);

  const handleTaskDelete = useCallback(async () => {
    try {
      await makeRequest(`${API_BASE_URL}/api/tasks/${id}/`, "DELETE");
      toast.success("Task deleted successfully!");
      navigate("/tasks");
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  }, [navigate, id, makeRequest]);

  const handleTaskUpdate = useCallback(() => {
    dispatch(fetchTaskDetail({ taskId: id }));
    setIsEditModalOpen(false);
    toast.success("Task updated successfully!");
  }, [dispatch, id]);

  const handleAssigneesUpdate = useCallback(() => {
    dispatch(fetchTaskDetail({ taskId: id }));
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center py-12">
            <ClipLoader color="#3B82F6" size={40} />
            <span className="mt-3 text-gray-600 text-sm sm:text-base">
              Loading task details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              Error Loading Task
            </h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            <span className="text-sm sm:text-base">Back</span>
          </button>

          <TaskInfoCard
            task={task}
            onEdit={handleEditTask}
            onDelete={() => setIsDeleteModalOpen(true)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Subtasks task={task} />
          </div>
          <div className="space-y-4 sm:space-y-6">
            <CreatorSection creator={task.creator} />
            <AssigneesSection />
            <AssetsSection taskId={task.id} projectId={task.project} />
          </div>
        </div>
      </div>

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        task={task}
        onTaskUpdate={handleTaskUpdate}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleTaskDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
};

export default TaskDetails;
