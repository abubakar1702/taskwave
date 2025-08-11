import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../../assets/taskwave-register.jpg";
import axios from "axios";
import GoogleOAuthButton from "./GoogleOAuthButton ";
import OTPInput from "./OTPInput";
import { ClipLoader } from "react-spinners";
import { IoArrowBack } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setUser } from "../../features/auth/authSlice";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState("form");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/users/auth/send-otp/`, {
        email: formData.email,
      });
      setCurrentStep("otp");
      setErrors({});
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to send verification code. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setErrors({});

    try {
      const checkResponse = await axios.post(
        `${API_BASE_URL}/api/users/check-email/`,
        { email: formData.email.toLowerCase().trim() }
      );

      if (checkResponse.data.exists) {
        setErrors({ email: "This email is already registered" });
        return;
      }

      await sendOTP();
    } catch (error) {
      setErrors({
        submit: "Error checking email availability. Please try again.",
      });
    }
  };

  const handleOTPComplete = async (otpCode) => {
    setOtpLoading(true);
    setOtpError("");

    try {
      const otpResponse = await axios.post(
        `${API_BASE_URL}/api/users/auth/verify-otp/`,
        {
          email: formData.email,
          otp: otpCode,
        },
        {
          validateStatus: (status) => status === 200,
        }
      );

      if (otpResponse.status === 200) {
        const registrationData = {
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        };

        const registerResponse = await axios.post(
          `${API_BASE_URL}/api/users/register/`,
          registrationData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );

        const loginResponse = await axios.post(
          `${API_BASE_URL}/api/users/login/`,
          {
            email: registrationData.email,
            password: registrationData.password,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "X-Requested-With": "XMLHttpRequest",
            },
          }
        );

        const storage = localStorage;
        storage.setItem("accessToken", loginResponse.data.access);
        storage.setItem("refreshToken", loginResponse.data.refresh);

        const userData = {
          id: loginResponse.data.user.id,
          email: loginResponse.data.user.email,
          firstName: loginResponse.data.user.first_name,
          lastName: loginResponse.data.user.last_name,
          name: `${loginResponse.data.user.first_name} ${loginResponse.data.user.last_name}`,
        };

        storage.setItem("user", JSON.stringify(userData));
        dispatch(setUser(userData));

        navigate("/");
      }
    } catch (error) {
      console.error("Registration flow error:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });

      if (error.config?.url.includes("verify-otp")) {
        setOtpError("Invalid verification code. Please try again.");
      } else if (error.config?.url.includes("register")) {
        if (error.response?.data?.email) {
          setOtpError(`Email error: ${error.response.data.email[0]}`);
        } else {
          setOtpError("Registration failed. Please try again.");
        }
      } else if (error.config?.url.includes("login")) {
        setOtpError("Account created but login failed. Please try logging in.");
      } else {
        setOtpError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError("");

    try {
      await axios.post(`${API_BASE_URL}/api/users/auth/send-otp/`, {
        email: formData.email,
      });
    } catch (error) {
      setOtpError(
        error.response?.data?.error ||
          "Failed to resend verification code. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep("form");
    setOtpError("");
  };

  const handleGoogleError = (errorMessage) => {
    setErrors({ submit: errorMessage });
  };

  const handleGoogleLoading = (isLoading) => {
    setGoogleLoading(isLoading);
  };

  const renderForm = () => (
    <>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Join TaskWave</h2>
        <p className="mt-2 text-gray-600">Create your account to get started</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              name="firstName"
              type="text"
              required
              disabled={isLoading || googleLoading}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100`}
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              name="lastName"
              type="text"
              required
              disabled={isLoading || googleLoading}
              className={`w-full px-4 py-2 rounded-lg border ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              } focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100`}
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            required
            disabled={isLoading || googleLoading}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.email ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            disabled={isLoading || googleLoading}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.password ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100`}
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            disabled={isLoading || googleLoading}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            } focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100`}
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || googleLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center space-x-2">
                <ClipLoader size={20} color="#fff" loading={isLoading} />
                <span>Sending verification...</span>
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-2">
        <GoogleOAuthButton
          keepLoggedIn={true}
          onError={handleGoogleError}
          onLoading={handleGoogleLoading}
        />
      </div>

      {errors.submit && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-600 text-center">{errors.submit}</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );

  const renderOTP = () => (
    <>
      <div className="mb-6">
        <button
          onClick={handleBackToForm}
          disabled={otpLoading}
          className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          <IoArrowBack className="w-4 h-4 mr-2" />
          Back to form
        </button>
      </div>

      <OTPInput
        length={6}
        email={formData.email}
        onComplete={handleOTPComplete}
        onResend={handleResendOTP}
        isLoading={otpLoading}
        error={otpError}
        resendCooldown={60}
      />

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-5xl w-full flex flex-col md:flex-row overflow-hidden rounded-xl shadow-lg bg-white">
        <div className="hidden md:block md:w-1/2 bg-indigo-600">
          <img
            src={registerImage}
            alt="TaskWave Registration"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-10 min-h-[700px]">
          {currentStep === "form" ? renderForm() : renderOTP()}
        </div>
      </div>
    </div>
  );
};

export default Register;
