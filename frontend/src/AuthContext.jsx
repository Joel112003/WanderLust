import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { safeGetItem, safeSetItem, safeRemoveItem, parseJWT } from "./utilis/js/storage";

const API_URL = (
  import.meta.env.VITE_APP_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "");
const API_ENDPOINTS = {
  login: `${API_URL}/auth/login`,
  register: `${API_URL}/auth/signup`,
  profile: `${API_URL}/auth/profile`,
  logout: `${API_URL}/auth/logout`,
  refresh: `${API_URL}/auth/refresh`,
};

console.log("[AuthContext] API URL:", API_URL);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  const setAuthHeader = useCallback((authToken) => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
      axios.defaults.withCredentials = true;
      console.log("[AuthContext] Auth header set");
    } else {
      delete axios.defaults.headers.common["Authorization"];
      console.log("[AuthContext] Auth header cleared");
    }
  }, []);

 useEffect(() => {
  try {
    const savedToken = safeGetItem("authToken");

    if (savedToken) {

      const payload = parseJWT(savedToken);
      if (!payload) {

        safeRemoveItem("authToken");
        safeRemoveItem("user");
        return;
      }

      if (payload.exp && payload.exp * 1000 < Date.now()) {

        safeRemoveItem("authToken");
        safeRemoveItem("user");
        return;
      }

      setToken(savedToken);
      setAuthHeader(savedToken);
    }
  } catch (error) {
    console.error('[AuthContext] Token initialization error:', error);
  } finally {
    setIsLoading(false);
  }
}, [setAuthHeader]);

  const fetchUserProfile = useCallback(async (authToken) => {
    try {
      console.log("[AuthContext] Fetching user profile...");
      const response = await axios.get(API_ENDPOINTS.profile, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.data.user || response.data.data) {
        const userData = response.data.user || response.data.data;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        setIsAuthenticated(true);
        console.log("[AuthContext] User profile fetched successfully");
        return userData;
      }
    } catch (error) {
      console.error("[AuthContext] Failed to fetch profile:", error.message);
      throw error;
    }
  }, []);

  const register = useCallback(
    async (userData) => {
      try {
        setError(null);
        setIsLoading(true);
        console.log("[AuthContext] Registering user:", userData.email);

        const response = await axios.post(API_ENDPOINTS.register, userData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const { token: authToken, user: responseUser } = response.data;

        if (!authToken) {
          throw new Error("No token received from server");
        }

        safeSetItem("authToken", authToken);
        safeSetItem("user", JSON.stringify(responseUser));

        setToken(authToken);
        setUser(responseUser);
        setAuthHeader(authToken);
        setIsAuthenticated(true);

        console.log("[AuthContext] Registration successful");
        return { success: true, user: responseUser };
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Registration failed";

        console.error("[AuthContext] Registration error:", errorMessage);
        setError(errorMessage);
        setIsAuthenticated(false);

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [setAuthHeader]
  );

 const login = useCallback(async (email, password) => {
  try {
    setError(null);
    setIsLoading(true);

    const response = await axios.post(
      API_ENDPOINTS.login,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const { token: authToken, user: responseUser } = response.data;

    if (!authToken) throw new Error("No token received from server");

    safeSetItem("authToken", authToken);
    safeSetItem("user", JSON.stringify(responseUser));
    setToken(authToken);
    setUser(responseUser);
    setAuthHeader(authToken);
    setIsAuthenticated(true);

    return { success: true, user: responseUser };
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Login failed";
    setError(errorMessage);
    setIsAuthenticated(false);
    return { success: false, error: errorMessage };
  } finally {
    setIsLoading(false);
  }
}, [setAuthHeader]);

  const logout = useCallback(async () => {
    try {
      console.log("[AuthContext] Logging out user...");

      if (token) {
        await axios.post(
          API_ENDPOINTS.logout,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      console.warn("[AuthContext] Logout API call failed (this is okay):", error.message);
    } finally {

      safeRemoveItem("authToken");
      safeRemoveItem("user");
      setToken(null);
      setUser(null);
      setAuthHeader(null);
      setIsAuthenticated(false);
      setError(null);
      console.log("[AuthContext] User logged out successfully");
    }
  }, [token, setAuthHeader]);

  const refreshToken = useCallback(async () => {
    try {
      console.log("[AuthContext] Refreshing token...");
      const response = await axios.post(
        API_ENDPOINTS.refresh,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { token: newToken } = response.data;

      if (!newToken) {
        throw new Error("No new token received");
      }

      safeSetItem("authToken", newToken);
      setToken(newToken);
      setAuthHeader(newToken);

      console.log("[AuthContext] Token refreshed successfully");
      return { success: true, token: newToken };
    } catch (error) {
      console.error("[AuthContext] Token refresh failed:", error.message);

      await logout();
      return { success: false, error: error.message };
    }
  }, [token, setAuthHeader, logout]);

  const checkAuth = useCallback(async () => {
    if (!token) {
      setIsAuthenticated(false);
      return false;
    }

    try {
      await fetchUserProfile(token);
      return true;
    } catch (error) {
      console.error("[AuthContext] Auth check failed:", error.message);
      setIsAuthenticated(false);
      return false;
    }
  }, [token, fetchUserProfile]);

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    checkAuth,
    setError,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
