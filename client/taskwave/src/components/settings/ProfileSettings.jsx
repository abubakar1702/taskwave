import React, { useState, useEffect, useMemo } from "react";
import { FaUser, FaCamera } from "react-icons/fa6";
import { useApi } from "../../hooks/useApi";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const ProfileSettings = ({ initialData, onUpdate }) => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    avatar: null,
    avatarFile: null,
  });

  const { makeRequest } = useApi();

  useEffect(() => {
    if (initialData) {
      setUserData({
        firstName: initialData.first_name || "",
        lastName: initialData.last_name || "",
        username: initialData.username || "",
        email: initialData.email || "",
        avatar: initialData.avatar_url || null,
        avatarFile: null,
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          avatar: e.target.result,
          avatarFile: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const formData = new FormData();
      if (userData.firstName) formData.append("first_name", userData.firstName);
      if (userData.lastName) formData.append("last_name", userData.lastName);
      if (userData.username) formData.append("username", userData.username);
      if (userData.avatarFile) formData.append("avatar", userData.avatarFile);

      const res = await makeRequest(
        `${API_BASE_URL}/api/users/me/`,
        "PATCH",
        formData,
        { "Content-Type": "multipart/form-data" }
      );

      toast.success(res.message || "Profile updated successfully.");
      onUpdate?.(res.user);

      setUserData((prev) => ({
        ...prev,
        firstName: res.user.first_name,
        lastName: res.user.last_name,
        username: res.user.username,
        avatar: res.user.avatar_url,
        avatarFile: null,
      }));
    } catch (err) {
      toast.error(err.data?.detail || "Failed to update profile.");
    }
  };

  // Determine if any changes were made
  const isChanged = useMemo(() => {
    if (!initialData) return false;
    return (
      userData.firstName !== (initialData.first_name || "") ||
      userData.lastName !== (initialData.last_name || "") ||
      userData.username !== (initialData.username || "") ||
      userData.avatarFile !== null
    );
  }, [userData, initialData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FaUser className="text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Profile</h2>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {userData.avatar ? (
                <img
                  src={userData.avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl text-gray-400">
                  {userData.firstName.charAt(0)}
                  {userData.lastName.charAt(0)}
                </div>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer"
            >
              <FaCamera className="text-white text-xs" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
          <span className="text-sm text-gray-500">Click camera to upload</span>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              name="firstName"
              type="text"
              value={userData.firstName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              name="lastName"
              type="text"
              value={userData.lastName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              name="username"
              type="text"
              value={userData.username}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={userData.email}
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdateProfile}
          disabled={!isChanged}
          className={`px-5 py-2.5 rounded-lg font-medium transition ${
            isChanged
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
