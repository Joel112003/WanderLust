import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
const profileEndpoint = `${API_URL}/auth/profile`;
const logoutEndpoint = `${API_URL}/auth/logout`;
const refreshEndpoint = `${API_URL}/auth/refresh`;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set default axios headers
  const setAuthHeader = useCallback((authToken) => {
    if (authToken) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    setAuthHeader(token);
  }, [token, setAuthHeader]);

  // Fetch user profile and handle token refresh
  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(profileEndpoint);
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        try {
          // Attempt token refresh if expired
          const refreshResponse = await axios.post(refreshEndpoint);
          if (refreshResponse.data.success) {
            const newToken = refreshResponse.data.token;
            localStorage.setItem("token", newToken);
            setToken(newToken);
            setAuthHeader(newToken);
            
            // Retry profile fetch with new token
            const retryResponse = await axios.get(profileEndpoint);
            if (retryResponse.data.success) {
              setUser(retryResponse.data.user);
              setIsAuthenticated(true);
              return;
            }
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
        }
      }
      
      // Fallback to logout if all fails
      handleLogout(false);
    } finally {
      setIsLoading(false);
    }
  }, [token, setAuthHeader]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (userData, authToken) => {
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setAuthHeader(authToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async (showNotification = true) => {
    try {
      await axios.post(logoutEndpoint);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setAuthHeader(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    refreshToken: fetchUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};