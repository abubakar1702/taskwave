import React, { useState } from "react";
import { FaXmark, FaPlus, FaUsers, FaUserGear } from "react-icons/fa6";
import AddTeamMemberModal from "../project modals/AddTeamMemberModal";
import ConfirmationModal from "../../modals/ConfirmationModal";
import { useApi } from "../../../hooks/useApi";
import Avatar from "../../common/Avatar";
import ChangeRoleModal from "../project modals/ChangeRoleModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ProjectTeam = ({ projectId, creatorId, currentUserId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });
  const [changeRoleModal, setChangeRoleModal] = useState({
    isOpen: false,
    member: null,
  });

  const {
    data: membersData,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useApi(
    projectId ? `${API_BASE_URL}/api/project/${projectId}/members/` : null,
    "GET",
    null,
    [projectId]
  );

  const {
    makeRequest,
    loading: removeLoading,
    error: removeError,
  } = useApi(null, "DELETE");

  const handleRemoveMember = (userId, userName) => {
    setConfirmationModal({ isOpen: true, userId, userName });
  };

  const confirmRemoveMember = async () => {
    if (!confirmationModal.userId || !projectId) return;

    try {
      await makeRequest(
        `${API_BASE_URL}/api/project/${projectId}/members/${confirmationModal.userId}/`,
        "DELETE"
      );

      await refetchMembers();
      setConfirmationModal({ isOpen: false, userId: null, userName: "" });
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const cancelRemoveMember = () => {
    setConfirmationModal({ isOpen: false, userId: null, userName: "" });
  };

  const handleChangeRole = (member) => {
    setChangeRoleModal({ isOpen: true, member });
  };

  const closeChangeRoleModal = () => {
    setChangeRoleModal({ isOpen: false, member: null });
  };

  const membersList = membersData || [];

  const sortedMembersList = [...membersList].sort((a, b) => {
    if (a.user.id === creatorId) return -1;
    if (b.user.id === creatorId) return 1;
    return 0;
  });

  const isUpdating = membersLoading || removeLoading;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
          <FaUsers /> Team Members ({membersList.length})
        </h3>
        {creatorId === currentUserId && (
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={isUpdating}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
            ) : (
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
            <span className="hidden sm:inline">
              {isUpdating ? "Updating..." : "Add Members"}
            </span>
            <span className="sm:hidden">
              {isUpdating ? "Updating..." : "Add"}
            </span>
          </button>
        )}
      </div>

      {membersError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {membersError.message || "Failed to load team members"}
          </p>
        </div>
      )}

      {removeError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">
            {removeError.message || "Failed to remove member"}
          </p>
        </div>
      )}

      {sortedMembersList.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 mb-2">
            <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 mx-auto" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base">No team members</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Project has no members yet
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {sortedMembersList.map((member, index) => (
            <div
              key={member.id}
              className={`flex items-center gap-3 py-3 ${
                index === 0 ? "pt-0" : ""
              } ${index === sortedMembersList.length - 1 ? "pb-0" : ""}`}
            >
              <Avatar
                name={member.user.first_name}
                url={member.user.avatar}
                size={10}
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {member.user.first_name || member.user.last_name
                    ? `${member.user.first_name} ${member.user.last_name}`.trim()
                    : member.user.username}
                  {member.user.id === creatorId && (
                    <span className="ml-2 badge-creator">Creator</span>
                  )}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {member.user.email}
                </p>
                <p className="text-xs text-gray-400 mt-1 italic">
                  {member.role?.name}
                </p>
              </div>
              {creatorId === currentUserId && member.user.id !== creatorId && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleChangeRole(member)}
                    disabled={isUpdating}
                    className="text-gray-400 hover:text-blue-500 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Change role"
                  >
                    <FaUserGear className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      handleRemoveMember(
                        member.user.id,
                        member.user.first_name || member.user.username
                      )
                    }
                    disabled={isUpdating}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Remove member"
                  >
                    <FaXmark className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddTeamMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        onAddMembers={refetchMembers}
        existingMembers={membersList}
      />

      <ChangeRoleModal
        isOpen={changeRoleModal.isOpen}
        onClose={closeChangeRoleModal}
        member={changeRoleModal.member}
        projectId={projectId}
        onRoleChanged={refetchMembers}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title="Remove Team Member?"
        message={`Are you sure you want to remove "${confirmationModal.userName}" from this project?`}
        onConfirm={confirmRemoveMember}
        onCancel={cancelRemoveMember}
        confirmText="Remove"
        loadingText="Removing..."
        isLoading={removeLoading}
        successMessage={`Member "${confirmationModal.userName}" removed successfully.`}
        errorMessage="Failed to remove member. Please try again."
      />
    </div>
  );
};

export default ProjectTeam;
