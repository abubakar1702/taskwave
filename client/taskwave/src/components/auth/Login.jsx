import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginImg from "../../assets/taskwave-login.jpg";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice";
import GoogleOAuthButton from "./GoogleOAuthButton ";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ClipLoader } from "react-spinners";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    keepLoggedIn: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleStorage = (data) => {
    try {
      if (!data?.access) throw new Error("Invalid token received");
      if (!data?.user) throw new Error("User data not found in response");

      const decoded = jwtDecode(data.access);
      if (!decoded?.exp || !decoded?.user_id) {
        throw new Error("Invalid token structure");
      }

      const storage = formData.keepLoggedIn ? localStorage : sessionStorage;
      storage.setItem("accessToken", data.access);

      if (data.refresh) {
        storage.setItem("refreshToken", data.refresh);
      }

      storage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: `${data.user.first_name} ${data.user.last_name}`,
          firstName: data.user.first_name,
          lastName: data.user.last_name,
        })
      );

      return true;
    } catch (err) {
      console.error("Token storage error:", err);
      setError("Failed to process login. Please try again.");
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (error) setError("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password.trim()) {
      setError("Password is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/users/login/`,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (!response.data?.access) {
        throw new Error("Invalid response from server");
      }

      dispatch(setUser(response.data.user));

      if (handleStorage(response.data)) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage = "Login failed. Please check your credentials.";
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Invalid email or password.";
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMessage) => {
    setError(errorMessage);
  };

  const handleGoogleLoading = (isLoading) => {
    setGoogleLoading(isLoading);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-500 to-indigo-600">
            <img
              src={loginImg}
              alt="TaskWave Login"
              className="h-full w-full object-cover opacity-90"
            />
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-10 min-h-[600px]">
            {showForgotPassword ? (
              <ForgotPassword
                onBackToLogin={() => setShowForgotPassword(false)}
                API_BASE_URL={API_BASE_URL}
              />
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Sign in to continue to TaskWave
                  </p>
                </div>

                <div className="mb-6">
                  <GoogleOAuthButton
                    keepLoggedIn={formData.keepLoggedIn}
                    onError={handleGoogleError}
                    onLoading={handleGoogleLoading}
                  />
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or sign in with email
                    </span>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading || googleLoading}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        error.includes("email")
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading || googleLoading}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          error.includes("password")
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading || googleLoading}
                        className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 focus:outline-none disabled:text-gray-300"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <IoEyeOff size={20} />
                        ) : (
                          <IoEye size={20} />
                        )}
                      </button>
                    </div>
                    <div className="mt-1 text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm text-center">
                        {error}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center">
                    <input
                      id="keepLoggedIn"
                      name="keepLoggedIn"
                      type="checkbox"
                      checked={formData.keepLoggedIn}
                      onChange={handleChange}
                      disabled={loading || googleLoading}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="keepLoggedIn"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Keep me logged in
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <ClipLoader size={20} color="#fff" />
                        Signing in...
                      </span>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-blue-600 hover:text-blue-500 transition duration-150"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
