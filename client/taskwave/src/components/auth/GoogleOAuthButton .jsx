import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { setUser } from "../../features/auth/authSlice";

const GoogleOAuthButton = React.memo(({ keepLoggedIn = false, onError, onLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const googleButtonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const initializationRef = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleStorage = useCallback((data, useLocalStorage = false) => {
    try {
      if (!data?.access) throw new Error("Invalid token received");
      if (!data?.user) throw new Error("User data not found in response");

      const decoded = jwtDecode(data.access);
      if (!decoded?.exp || !decoded?.user_id) {
        throw new Error("Invalid token structure");
      }

      const storage = useLocalStorage ? localStorage : sessionStorage;
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
      if (onError)
        onError("Failed to process authentication. Please try again.");
      return false;
    }
  }, [onError]);

  const handleGoogleResponse = useCallback(async (response) => {
    setIsLoading(true);
    if (onLoading) onLoading(true);
    if (onError) onError("");

    try {
      const decoded = jwtDecode(response.credential);
      console.log("Decoded Google token:", decoded);
      const res = await axios.post(
        `${API_BASE_URL}/api/users/auth/google/`,
        {
          token: response.credential,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        }
      );

      if (!res.data?.access) {
        throw new Error("Invalid response from server");
      }

      if (res.data.user) {
        dispatch(setUser(res.data.user));
      }

      if (handleStorage(res.data, keepLoggedIn)) {
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Google Authentication error:", err);
      console.error("Full error details:", {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
        request: err.request,
      });

      let errorMessage = "Google authentication failed.";
      if (err.response) {
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || "Invalid Google token.";
        } else if (err.response.status === 401) {
          errorMessage = "Authentication failed. Please try again.";
        } else if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      if (onError) onError(errorMessage);
    } finally {
      setIsLoading(false);
      if (onLoading) onLoading(false);
    }
  }, [API_BASE_URL, keepLoggedIn, onError, onLoading, dispatch, navigate, handleStorage]);

  const initializeGoogle = useCallback(() => {
    if (window.google && googleButtonRef.current && GOOGLE_CLIENT_ID && !initializationRef.current) {
      try {
        console.log(
          "Initializing Google OAuth with client ID:",
          GOOGLE_CLIENT_ID
        );

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          ux_mode: "popup",
          auto_select: false,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
        });

        initializationRef.current = true;
        console.log("Google OAuth initialized successfully");
      } catch (err) {
        console.error("Google OAuth initialization error:", err);
        if (onError) onError("Failed to initialize Google authentication.");
      }
    }
  }, [GOOGLE_CLIENT_ID, handleGoogleResponse, onError]);

  useEffect(() => {
    if (initializationRef.current) return;

    const loadGoogleScript = () => {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (onError) {
            onError(
              "Failed to load Google authentication. Please try again later."
            );
          }
        };
        document.body.appendChild(script);
      }
    };

    loadGoogleScript();
    
    const checkInterval = setInterval(() => {
      if (window.google) {
        initializeGoogle();
        clearInterval(checkInterval);
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
    };
  }, [initializeGoogle, onError]);

  return (
    <div className="w-full">
      <div 
        ref={googleButtonRef} 
        className="flex justify-center w-full h-[40px]"
      ></div>
      {isLoading && (
        <p className="mt-2 text-center text-sm text-gray-500">
          Authenticating with Google...
        </p>
      )}
    </div>
  );
});

GoogleOAuthButton.displayName = 'GoogleOAuthButton';

export default GoogleOAuthButton;