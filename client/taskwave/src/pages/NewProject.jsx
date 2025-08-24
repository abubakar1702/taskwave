import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUsers, FaClipboardList, FaRegFolder } from "react-icons/fa6";
import { ClipLoader } from "react-spinners";
import UserSearch from "../components/task/new task/UserSearch";
import { useApi } from "../hooks/useApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const NewProject = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberRoles, setMemberRoles] = useState({});
  const [errors, setErrors] = useState({});

  const {
    data: rolesData,
    loading: loadingRoles,
    error: rolesError,
  } = useApi(`${API_BASE_URL}/api/project/roles/`, "GET");

  const { data: currentUser, loading: loadingUser } = useApi(
    `${API_BASE_URL}/api/users/me/`,
    "GET"
  );

  useEffect(() => {
    if (rolesData) setRoles(rolesData);
  }, [rolesData]);

  useEffect(() => {
    if (rolesError) {
      setErrors({ general: "Failed to load roles. Please try again." });
    }
  }, [rolesError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectUser = (user) => {
    if (!selectedMembers.find((m) => m.id === user.id)) {
      setSelectedMembers((prev) => [...prev, user]);
      if (roles.length === 1) {
        setMemberRoles((prev) => ({ ...prev, [user.id]: roles[0].name }));
      }
    }
  };

  const handleRemoveUser = (userId) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
    setMemberRoles((prev) => {
      const newRoles = { ...prev };
      delete newRoles[userId];
      return newRoles;
    });
  };

  const handleRoleChange = (userId, roleName) => {
    setMemberRoles((prev) => ({ ...prev, [userId]: roleName }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Project title is required";
    if (!formData.description.trim())
      newErrors.description = "Project description is required";

    selectedMembers.forEach((member) => {
      if (!memberRoles[member.id]) {
        newErrors[`member_${member.id}_role`] = `Role is required for ${
          member.first_name || member.username
        }`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const accessToken =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("authToken");

      if (!accessToken) {
        navigate("/login");
        return;
      }
      if (!currentUser) throw new Error("User info not available");

      const adminRole = roles.find((r) => r.name === "Admin") || roles[0];
      if (!adminRole) throw new Error("No roles available");

      const creatorAssignment = {
        user_id: currentUser.id,
        role_id: adminRole.id,
      };
      const memberAssignments = selectedMembers
        .filter((m) => memberRoles[m.id])
        .map((m) => {
          const selectedRole = roles.find((r) => r.name === memberRoles[m.id]);
          if (!selectedRole) throw new Error(`Role not found for user ${m.id}`);
          return { user_id: m.id, role_id: selectedRole.id };
        });

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        member_assignments: [creatorAssignment, ...memberAssignments],
      };

      const response = await fetch(`${API_BASE_URL}/api/projects/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrors(errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await response.json();
      navigate("/projects");
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loadingRoles || loadingUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <ClipLoader color="#2563EB" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="p-2 bg-white shadow rounded-lg hover:bg-gray-100 transition"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            Create A New Project
          </h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Project Information
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Describe your project"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                <FaUsers className="text-blue-600" /> Team Members
              </h2>
              <UserSearch
                selectedUsers={selectedMembers}
                onSelectUser={handleSelectUser}
                onRemoveUser={handleRemoveUser}
                placeholder="Search team members by email..."
                disabled={loading}
                showSelectedMembers={false}
              />

              {selectedMembers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Assign Roles
                  </h4>
                  <div className="space-y-3">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg hover:shadow-sm transition"
                      >
                        <div className="flex items-center space-x-3">
                          {member.avatar ? (
                            <img
                              src={
                                member.avatar.startsWith("http")
                                  ? member.avatar
                                  : `${API_BASE_URL}${member.avatar}`
                              }
                              alt={member.username}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {(member.first_name || member.username || "")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {member.first_name && member.last_name
                                ? `${member.first_name} ${member.last_name}`
                                : member.first_name || member.username}
                            </p>
                            <p className="text-sm text-gray-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        <select
                          value={memberRoles[member.id] || ""}
                          onChange={(e) =>
                            handleRoleChange(member.id, e.target.value)
                          }
                          className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors[`member_${member.id}_role`]
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Role</option>
                          {roles.map((role, index) => (
                            <option key={index} value={role.name}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>

                  {selectedMembers.some(
                    (m) => errors[`member_${m.id}_role`]
                  ) && (
                    <div className="mt-2 space-y-1">
                      {selectedMembers.map(
                        (m) =>
                          errors[`member_${m.id}_role`] && (
                            <p key={m.id} className="text-sm text-red-600">
                              {errors[`member_${m.id}_role`]}
                            </p>
                          )
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/projects")}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg shadow hover:shadow-md hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading && <ClipLoader color="#ffffff" size={16} />}
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
