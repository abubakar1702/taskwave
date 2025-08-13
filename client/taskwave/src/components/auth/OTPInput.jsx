import React, { useState, useRef, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { HiOutlineMail } from "react-icons/hi";

const OTPInput = ({
  length = 6,
  onComplete,
  onResend,
  isLoading = false,
  error = "",
  email = "",
  resendCooldown = 60,
}) => {
  const [otp, setOtp] = useState(new Array(length).fill(""));
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every((digit) => digit !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text");
    const pasteArray = pasteData
      .split("")
      .filter((char) => !isNaN(char))
      .slice(0, length);

    const newOtp = [...otp];
    pasteArray.forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit;
      }
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasteArray.length, length - 1);
    inputRefs.current[nextIndex].focus();

    if (newOtp.every((digit) => digit !== "") && onComplete) {
      onComplete(newOtp.join(""));
    }
  };

  const handleResend = () => {
    if (resendTimer === 0 && onResend) {
      onResend();
      setResendTimer(resendCooldown);
      setOtp(new Array(length).fill(""));
      inputRefs.current[0].focus();
    }
  };

  const clearOtp = () => {
    setOtp(new Array(length).fill(""));
    inputRefs.current[0].focus();
  };

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
          <HiOutlineMail className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Check your email
        </h3>
        <p className="text-gray-600 text-sm">
          We've sent a verification code to
        </p>
        <p className="text-indigo-600 font-medium text-sm">{email}</p>
      </div>

      <div className="flex justify-center space-x-3 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={isLoading}
            className={`w-12 h-12 text-center text-lg font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
              error
                ? "border-red-500 bg-red-50"
                : digit
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 bg-white hover:border-gray-400"
            } disabled:bg-gray-100 disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>

        <button
          type="button"
          onClick={handleResend}
          disabled={resendTimer > 0 || isLoading}
          className={`text-sm font-medium transition-colors ${
            resendTimer > 0 || isLoading
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:text-indigo-500 cursor-pointer"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center space-x-2">
              <ClipLoader size={16} color="#6366f1" />
              <span>Sending...</span>
            </span>
          ) : resendTimer > 0 ? (
            `Resend code in ${resendTimer}s`
          ) : (
            "Resend code"
          )}
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={clearOtp}
          disabled={isLoading}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
        >
          Clear code
        </button>
      </div>
    </div>
  );
};

export default OTPInput;
