import React, { useState } from "react";
import axios from "axios";
import OTPInput from "./OTPInput";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";

const ForgotPassword = ({ onBackToLogin, API_BASE_URL }) => {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");

  const checkEmailExists = async (email) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/check-email/`,
        { email }
      );
      return response.data.exists;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const emailExists = await checkEmailExists(email);
      if (!emailExists) {
        setError("This email is not registered with us");
        return;
      }

      await axios.post(`${API_BASE_URL}/api/users/auth/send-otp/`, {
        email,
        purpose: "password_reset",
      });
      setOtpSent(true);
      setOtpVerified(false);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to send verification code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (otpCode) => {
    setEnteredOtp(otpCode);
    setOtpLoading(true);
    setOtpError("");

    try {
      await axios.post(`${API_BASE_URL}/api/users/auth/verify-otp/`, {
        email,
        otp: otpCode,
      });
      setOtpVerified(true);
      setOtpError("");
    } catch (err) {
      setOtpError(
        err.response?.data?.error ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setError("");

    try {
      if (!newPassword || !confirmPassword) {
        throw new Error("Please fill in all fields");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const response = await axios.post(
        `${API_BASE_URL}/api/users/reset-password/`,
        {
          email: email,
          otp: enteredOtp,
          new_password: newPassword,
        }
      );

      if (response.data.message) {
        setError("Password reset successful! Redirecting to login...");
        setTimeout(() => {
          onBackToLogin();
        }, 2000);
      } else {
        throw new Error("Password reset failed. Please try again.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Password reset failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Reset Password</h2>
        <p className="mt-2 text-gray-600">
          {otpVerified
            ? "Set your new password"
            : otpSent
            ? `Enter the verification code sent to ${email}`
            : "Enter your email to receive a verification code"}
        </p>
      </div>

      {!otpVerified ? (
        <>
          {!otpSent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="flex flex-col space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <ClipLoader size={20} color="#fff" />
                      Sending OTP...
                    </span>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBackToLogin}
                  disabled={loading}
                  className="flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <IoArrowBack className="w-4 h-4 mr-2" />
                  Back to login
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <OTPInput
                length={6}
                onComplete={handleOTPVerification}
                isLoading={otpLoading}
                error={otpError}
              />
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtpError("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Change Email
                </button>
                <button
                  onClick={onBackToLogin}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                  <IoArrowBack className="w-4 h-4 mr-1" />
                  Back to login
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Confirm your password"
            />
          </div>

          {error && (
            <div
              className={`p-3 rounded-lg border text-sm text-center ${
                error.includes("successful")
                  ? "bg-green-50 border-green-200 text-green-600"
                  : "bg-red-50 border-red-200 text-red-600"
              }`}
            >
              <p>{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={onBackToLogin}
              className="flex-1 py-2.5 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordReset}
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <ClipLoader size={20} color="#fff" />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
