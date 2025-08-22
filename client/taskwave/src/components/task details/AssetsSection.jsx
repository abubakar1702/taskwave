import React, { useState } from "react";
import { format } from "date-fns";
import {
  HiOutlinePlus,
  HiOutlineDownload,
  HiOutlineTrash,
} from "react-icons/hi";
import { AiOutlinePaperClip } from "react-icons/ai";
import AddAssetModal from "./AddAssetModal";
import { useParams } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import ConfirmationModal from "../modals/ConfirmationModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const AssetsSection = ({ taskId: propTaskId, projectId = null }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const { taskId: routeTaskId } = useParams();
  const taskId = propTaskId || routeTaskId;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingAssetId, setDeletingAssetId] = useState(null);

  const {
    data: assets,
    loading: isLoading,
    error,
    refetch,
    makeRequest,
  } = useApi(
    taskId ? `${API_BASE_URL}/api/assets/list/?task=${taskId}` : null,
    "GET",
    null,
    [taskId]
  );

  const getUserDisplayName = (user) => {
    if (!user) return "Unknown";
    const { first_name, last_name, username } = user;
    return first_name || last_name
      ? `${first_name || ""} ${last_name || ""}`.trim()
      : username;
  };

  const handleAddAsset = async (file) => {
    if (!file || !taskId) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("task", taskId);
    if (projectId) formData.append("project", projectId);

    try {
      await makeRequest(`${API_BASE_URL}/api/assets/`, "POST", formData);
      await refetch();
    } catch (err) {
      console.error("Failed to upload asset:", err);
      throw new Error(err.message || "Failed to upload asset");
    }
  };

  const handleRemoveAsset = async (assetId) => {
    setDeletingAssetId(assetId);
    try {
      await makeRequest(`${API_BASE_URL}/api/assets/${assetId}/`, "DELETE");
      await refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeletingAssetId(null);
    }
  };

  const confirmRemoveAsset = (asset) => {
    setAssetToDelete(asset);
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      handleRemoveAsset(assetToDelete.id);
    }
    setModalOpen(false);
    setAssetToDelete(null);
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setAssetToDelete(null);
  };

  const getFileExtension = (filename) =>
    filename.split(".").pop().toLowerCase();

  const getFileIcon = (filename) => {
    const ext = getFileExtension(filename);
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext))
      return "🖼️";
    if (["pdf", "doc", "docx", "txt", "rtf"].includes(ext)) return "📄";
    if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "🗜️";
    return "📎";
  };

  const getFileName = (fileUrl) => {
    if (typeof fileUrl === "string") {
      return fileUrl.split("/").pop();
    }
    if (fileUrl && fileUrl.name) {
      return fileUrl.name;
    }
    return "Unknown file";
  };

  const assetsList = assets || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Assets{" "}
          {assetsList.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({assetsList.length})
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HiOutlinePlus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Add Asset</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-700 text-sm">
            Failed to load assets: {error.message}
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-600">Loading assets...</span>
        </div>
      ) : assetsList.length > 0 ? (
        <div className="space-y-3">
          {assetsList.map((asset) => {
            const filename = getFileName(asset.file);
            const isDeleting = deletingAssetId === asset.id;

            return (
              <div
                key={asset.id}
                className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
                  isDeleting ? "opacity-50" : ""
                }`}
              >
                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-lg">{getFileIcon(filename)}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4
                    className="text-sm font-medium text-gray-900 truncate"
                    title={filename}
                  >
                    {filename}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>by: {getUserDisplayName(asset.uploaded_by)}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(asset.uploaded_at), "MMM dd, yyyy")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={asset.file}
                    download
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download asset"
                  >
                    <HiOutlineDownload className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                  <button
                    onClick={() => confirmRemoveAsset(asset)}
                    disabled={isDeleting}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove asset"
                  >
                    {isDeleting ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <HiOutlineTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8">
          <AiOutlinePaperClip className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400" />
          <p className="text-gray-600 text-sm sm:text-base">
            No assets attached
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Click "Add Asset" to attach files
          </p>
        </div>
      )}

      <AddAssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddAsset}
        taskId={taskId}
        projectId={projectId}
      />

      <ConfirmationModal
        isOpen={modalOpen}
        title="Delete Asset?"
        message={`Are you sure you want to remove "${
          assetToDelete ? getFileName(assetToDelete.file) : ""
        }"?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        loadingText="Deleting..."
        successMessage="Asset deleted successfully!"
        errorMessage="Failed to delete asset. Please try again."
      />
    </div>
  );
};

export default AssetsSection;
