import React, { useState, useMemo } from "react";
import { FaLock } from "react-icons/fa6";
import { useApi } from "../../hooks/useApi";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const Security = () => {
  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { makeRequest } = useApi();

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = async () => {
    if (!securityData.currentPassword || !securityData.newPassword) {
      toast.error("Please fill out all password fields.");
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      const res = await makeRequest(
        `${API_BASE_URL}/api/users/password/`,
        "POST",
        {
          current_password: securityData.currentPassword,
          new_password: securityData.newPassword,
        }
      );
      toast.success(res.message || "Password updated successfully.");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.data?.detail || "Failed to update password.");
    }
  };

  const isDisabled = useMemo(() => {
    return (
      !securityData.currentPassword &&
      !securityData.newPassword &&
      !securityData.confirmPassword
    );
  }, [securityData]);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <FaLock className="text-red-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Security</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <input
            name="currentPassword"
            type="password"
            value={securityData.currentPassword}
            onChange={handleSecurityChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              value={securityData.newPassword}
              onChange={handleSecurityChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Re-enter New Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={securityData.confirmPassword}
              onChange={handleSecurityChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleUpdatePassword}
          disabled={isDisabled}
          className={`px-5 py-2.5 rounded-lg font-medium transition ${
            isDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          Update Password
        </button>
      </div>
    </div>
  );
};

export default Security;
