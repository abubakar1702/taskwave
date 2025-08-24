import { useState, useRef, useEffect } from "react";
import {
  FaArrowLeft,
  FaEllipsis,
  FaPenToSquare,
  FaTrashCan,
  FaRightToBracket,
} from "react-icons/fa6";
import ProjectUpdateModal from "../project modals/ProjectUpdateModal";
import ConfirmationModal from "../../modals/ConfirmationModal";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

const ProjectHeader = ({
  title,
  project,
  onBack,
  onEdit,
  onDelete,
  onLeave,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const menuRef = useRef();
  const { currentUser } = useCurrentUser();

  const isProjectCreator = project?.creator?.id === currentUser?.id;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Back & Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          </div>

          {/* 3 Dot Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FaEllipsis className="w-6 h-6 text-gray-600" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                {isProjectCreator && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                  >
                    <FaPenToSquare className="w-4 h-4" /> Edit
                  </button>
                )}
                {isProjectCreator && (
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FaTrashCan className="w-4 h-4" /> Delete
                  </button>
                )}
                {!isProjectCreator && (
                  <button
                    onClick={() => setIsLeaveModalOpen(true)}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    <FaRightToBracket className="w-4 h-4" /> Leave Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <ProjectUpdateModal
          isOpen={isEditModalOpen}
          project={project}
          onClose={() => setIsEditModalOpen(false)}
          onSave={onEdit}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Delete Project?"
          message="Are you sure you want to delete this project? This action cannot be undone."
          confirmText="Delete"
          loadingText="Deleting..."
          successMessage="Project deleted successfully!"
          errorMessage="Failed to delete project."
          onConfirm={onDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />
      )}

      {isLeaveModalOpen && (
        <ConfirmationModal
          isOpen={isLeaveModalOpen}
          title="Leave Project?"
          message="Are you sure you want to leave this project? You will need to be re-invited to rejoin."
          confirmText="Leave"
          loadingText="Leaving..."
          successMessage="You have successfully left the project!"
          errorMessage="Failed to leave project."
          onConfirm={onLeave}
          onCancel={() => setIsLeaveModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProjectHeader;
