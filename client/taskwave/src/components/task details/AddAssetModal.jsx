import React, { useState } from "react";
import { HiOutlineX } from "react-icons/hi";
import { AiOutlinePaperClip } from "react-icons/ai";

const AddAssetModal = ({ isOpen, onClose, onAdd, taskId, projectId }) => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e, closeAfter = true) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      await onAdd(file);

      setFile(null);
      setError("");

      if (closeAfter) onClose();
    } catch (error) {
      setError(error.message || "Failed to upload asset");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setError("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-6 mx-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Add New Asset</h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <HiOutlineX className="w-6 h-6" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={(e) => {
                  setFile(e.target.files[0]);
                  setError("");
                }}
                disabled={isUploading}
                className="block w-full text-sm text-gray-700 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <AiOutlinePaperClip className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            {file && (
              <p className="text-xs text-gray-600 mt-1">
                Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                MB)
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="px-4 py-2 bg-sky-700 text-white rounded-lg hover:bg-sky-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isUploading ? "Uploading..." : "Add Asset"}
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isUploading || !file}
              className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isUploading ? "Uploading..." : "Add & Continue Adding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAssetModal;
