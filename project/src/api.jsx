import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// Ensure this matches your Django backend's base URL
const API_BASE_URL = 'http://localhost:8000/api'; 

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Corrected: use `setUser` as the setter for the `user` state
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      return null;
    }
  });
  const [accessToken, setAccessToken] = useState(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'));
  const [loading, setLoading] = useState(true);
  const [generalError, setGeneralError] = useState(null);

  // Helper function to clear auth state
  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Also remove user data from local storage
    setGeneralError(null);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    clearAuth();
    // Potentially redirect to login page here, or let router handle it
    // navigate('/login'); // If using useNavigate from react-router-dom
  }, [clearAuth]);

  // Function to refresh token
  const refreshAuthToken = useCallback(async () => {
    if (!refreshToken) {
      console.warn("No refresh token available. Cannot refresh.");
      logout();
      return false;
    }
    try {
      // Ensure the refresh endpoint is correct, often /token/refresh/ or /auth/token/refresh/
      const response = await axios.post(`${API_BASE_URL}/user/token/refresh/`, { refresh: refreshToken });
      const newAccessToken = response.data.access;
      localStorage.setItem('accessToken', newAccessToken);
      setAccessToken(newAccessToken);
      // console.log("Token refreshed successfully. New access token:", newAccessToken);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        setGeneralError("Session expired. Please log in again.");
      } else {
        setGeneralError("Failed to refresh session.");
      }
      logout(); // Log out on refresh failure
      return false;
    }
  }, [refreshToken, logout]); // Depend on refreshToken and logout

  // Function to fetch current user data (used after login/signup or on app load)
  const fetchUser = useCallback(async () => {
    if (!accessToken) {
      setUser(null);
      return;
    }
    try {
      // Assuming a /user/me/ or /user/profile/ endpoint exists for fetching current user details
      // Use the 'api' instance which already handles auth headers
      const response = await api.get('/user/profile/'); 
      setUser(response.data.user); // Backend response from profile/ endpoint usually wraps user data
      localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user data in local storage
    } catch (error) {
      console.error('Failed to fetch user data with current token:', error.response?.data || error.message);
      // If fetching user fails, it might mean the access token is invalid or expired
      // The response interceptor will handle 401s, but we'll also catch here for clarity.
      if (error.response?.status === 401) {
        console.warn("Access token invalid or expired during user fetch. Attempting refresh...");
        const refreshed = await refreshAuthToken();
        if (refreshed) {
          // If token was refreshed, retry fetching user
          try {
            const retryResponse = await api.get('/user/profile/');
            setUser(retryResponse.data.user); // Access the nested user data
            localStorage.setItem('user', JSON.stringify(retryResponse.data.user)); // Update user in local storage
          } catch (retryError) {
            console.error('Failed to fetch user after token refresh:', retryError);
            logout();
          }
        } else {
          logout(); // If refresh failed, log out
        }
      } else {
        // Other errors during user fetch (e.g., network issues)
        setGeneralError("Failed to load user data.");
        logout(); // Or keep user if appropriate for non-auth errors
      }
    }
  }, [accessToken, refreshAuthToken, logout]);


  // Axios interceptor for response errors (e.g., 401 Unauthorized)
  useEffect(() => {
    // Interceptor to attach Authorization token
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken'); // Get latest token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );


    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        // console.log("Interceptor caught error:", error.response?.status, originalRequest.url, originalRequest._retry);

        // If 401 and it's not a retry attempt and not the refresh token endpoint itself
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url.includes('/token/refresh/')
        ) {
          originalRequest._retry = true;
          // console.log("Attempting token refresh for:", originalRequest.url);
          const refreshed = await refreshAuthToken();
          if (refreshed) {
            // Update the authorization header for the original failed request
            originalRequest.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;
            // Retry the original request with new token
            // console.log("Retrying original request with new token:", originalRequest.url);
            return api(originalRequest);
          }
        }
        // If the error is still 401 after refresh attempt (or if refresh failed), logout
        if (error.response?.status === 401) {
            // console.log("Final 401 after refresh attempt, logging out.");
            logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAuthToken, logout]); // Dependencies for useEffect

  // --- Login Function ---
  const login = async (credentials) => {
    setGeneralError(null); // Clear previous errors
    try {
        // Send the request to your JWT token endpoint
        // This hits the CustomTokenObtainPairView in Django
        const response = await axios.post(`${API_BASE_URL}/user/login/`, {
            email: credentials.email,
            password: credentials.password,
        });

        // Backend directly returns 'access', 'refresh', and 'user' at the top level
        const { access, refresh, user: userData } = response.data; // Destructure user as userData to avoid name clash

        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        localStorage.setItem('user', JSON.stringify(userData)); // Store user data including role

        setAccessToken(access); // Update local state
        setRefreshToken(refresh); // Update local state
        setUser(userData); // CORRECTED: Use `setUser` instead of `setCurrentUser`
        setGeneralError(null);

        return { success: true, user: userData };
    } catch (error) {
        console.error('Login error:', error.response?.data || error.message);
        const errorData = error.response?.data;
        let errorMessage = 'An unexpected error occurred during login.';
        let fieldErrors = {};

        if (errorData) {
            if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (errorData.errors) {
                fieldErrors = errorData.errors;
                if (Object.keys(fieldErrors).length > 0) {
                    errorMessage = Object.values(fieldErrors)[0];
                }
            } else if (errorData.non_field_errors) {
                errorMessage = errorData.non_field_errors[0];
            }
        }

        setGeneralError(errorMessage);
        return { success: false, error: errorMessage, errors: fieldErrors };
    }
  }; 

  // --- Signup Function ---
  const signup = async (userData) => {
    setGeneralError(null);
    try {
      const response = await api.post('/user/register/', userData); 
      
      // Backend's register view returns 'user' and 'tokens' as nested objects
      const { user: registeredUser, tokens } = response.data; // Destructure user and tokens
      const { access, refresh } = tokens; // Destructure access and refresh from tokens

      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(registeredUser)); 

      setAccessToken(access);
      setRefreshToken(refresh);
      setUser(registeredUser); // Set the user data from registration response
      
      return { success: true, user: registeredUser };
    } catch (err) {
      console.error('Signup error:', err.response?.data || err.message);
      const errorData = err.response?.data;
      if (errorData) {
        if (errorData.detail) {
          setGeneralError(errorData.detail);
          return { success: false, error: errorData.detail };
        }
        if (errorData.email && Array.isArray(errorData.email) && errorData.email.includes("A user with this email already exists.")) {
            setGeneralError("An account with this email already exists.");
            return { success: false, error: "An account with this email already exists." };
        }
        if (errorData.non_field_errors) {
            setGeneralError(errorData.non_field_errors.join(', '));
            return { success: false, error: errorData.non_field_errors.join(', ') };
        }
        return { success: false, errors: errorData }; 
      }
      setGeneralError('An unexpected error occurred during signup.');
      return { success: false, error: 'An unexpected error occurred during signup.' };
    }
  };

  // Fetch user profile data (alias for fetchUser if they hit the same endpoint)
  const fetchUserProfile = useCallback(async () => {
    setGeneralError(null);
    try {
      // fetchUser already updates the `user` state, so just call it.
      await fetchUser(); 
      // The `user` state should be updated by fetchUser, so we return it directly.
      return { success: true, data: user }; 
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      // Errors are handled by fetchUser and interceptor, so generalError should be set there.
      return { success: false, error: generalError || 'Failed to fetch profile.' };
    }
  }, [fetchUser, user, generalError]);


// Inside your AuthProvider in api.jsx

const updateProfile = async (profileData) => {
    setGeneralError(null); // Clear previous errors
    try {
        // This PATCH request correctly targets your custom endpoint for partial updates
        const response = await api.patch('/user_profile/my-profile/update/', profileData);

        // Flexibly handle backend response structure
        const updatedPartialUserData = response.data.user || response.data;

        // --- FIX: Merge with existing user data before saving to localStorage ---
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const mergedUser = { ...currentUser, ...updatedPartialUserData };

        // Update React state with the complete, merged user object
        setUser(mergedUser);
        
        // Update localStorage with the complete, merged user object to prevent data loss
        localStorage.setItem('user', JSON.stringify(mergedUser));

        return { success: true, data: mergedUser };

    } catch (err) {
        console.error('Failed to update user profile:', err.response?.data || err.message);
        const errorData = err.response?.data;

        if (errorData) {
            if (errorData.detail) {
                setGeneralError(errorData.detail);
                return { success: false, error: errorData.detail };
            }
            // This correctly returns field-specific errors for display in your form
            setGeneralError('Validation error. Please check your inputs.');
            return { success: false, errors: errorData };
        }
        
        // Fallback for network errors or other unexpected issues
        setGeneralError('An unexpected error occurred during the profile update.');
        return { success: false, error: 'An unexpected error occurred.' };
    }
};
  // Initial load to check for token and fetch user
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true); 
      // If there's an access token, try to fetch user details
      // This implicitly validates the token; if it's expired/invalid, interceptor handles refresh/logout
      await fetchUser(); 
      setLoading(false); 
    };
    initializeAuth();
  }, [fetchUser]); // Only depend on fetchUser, as it handles accessToken internally

  const authContextValue = {
    user,
    loading,
    generalError,
    login,
    signup,
    logout,
    fetchUserProfile,
    updateProfile,
    isAuthenticated: !!user, 
    accessToken,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};