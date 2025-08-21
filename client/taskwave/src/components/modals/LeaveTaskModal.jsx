import React from 'react';

/**
 * @typedef {Object} LeaveTaskModalProps
 * @property {boolean} isOpen - Controls whether the modal is visible.
 * @property {function} onClose - Function to call when the modal should be closed (e.g., on cancel or clicking outside).
 * @property {function} onConfirm - Function to call when the user confirms the action (e.g., leaving the task).
 * @property {string} [title="Confirm Leave Task"] - Optional title for the modal.
 * @property {string} [message="Are you sure you want to leave this task? You will no longer be assigned to it."] - Optional message for the modal.
 * @property {string} [confirmText="Leave Task"] - Optional text for the confirm button.
 * @property {string} [cancelText="Cancel"] - Optional text for the cancel button.
 */

/**
 * A modal component for confirming the action of leaving a task.
 * It provides a clear message and options to confirm or cancel.
 *
 * @param {LeaveTaskModalProps} props - The props for the LeaveTaskModal component.
 */
const LeaveTaskModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Leave Task",
  message = "Are you sure you want to leave this task? You will no longer be assigned to it.",
  confirmText = "Leave Task",
  cancelText = "Cancel",
}) => {
  // If the modal is not open, return null to render nothing.
  if (!isOpen) return null;

  return (
    // Modal Overlay - Fixed position to cover the entire screen
    <div
      className="fixed inset-0 bg-gray-900/20 bg-opacity-75/20 flex items-center justify-center p-4 sm:p-6 z-50 transition-opacity duration-300"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onClick={onClose} // Close modal when clicking on the backdrop
    >
      {/* Modal Content - Centered and responsive */}
      <div
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-lg w-full transform transition-all duration-300 scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal content
      >
        {/* Modal Title */}
        <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center">
          {title}
        </h2>

        {/* Modal Message */}
        <p id="modal-description" className="text-gray-600 text-base sm:text-lg text-center mb-8 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            type="button"
            className="flex-1 px-6 py-3 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium transition-colors text-base"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="flex-1 px-6 py-3 rounded-xl border border-transparent bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 font-medium transition-colors text-base"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveTaskModal;
