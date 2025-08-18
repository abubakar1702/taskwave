import React, { useState } from "react";
import { IoWarningOutline } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";

const ConfirmationModal = ({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  onConfirm,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      toast.success("Deleted successfully!");
      onCancel();
    } catch (err) {
      toast.error("Failed to delete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <IoWarningOutline className="text-red-600 w-6 h-6" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
          {title}
        </h3>

        <p className="text-gray-600 text-center mb-6">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-medium transition ${
              loading
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              loading
                ? "bg-red-600 text-white cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {loading ? (
              <>
                <ClipLoader size={18} color="#fff" />
                <span>Deleting...</span>
              </>
            ) : (
              "Confirm"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
