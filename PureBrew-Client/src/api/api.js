import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

// ✅ CSRF Token Management - Enhanced
let csrfToken = null;
let isGettingToken = false;

export const getCsrfToken = async () => {
  if (isGettingToken) {
    // Wait for ongoing token request
    return new Promise((resolve) => {
      const checkToken = () => {
        if (csrfToken) {
          resolve(csrfToken);
        } else {
          setTimeout(checkToken, 100);
        }
      };
      checkToken();
    });
  }

  isGettingToken = true;
  try {
    const res = await api.get("/csrf-token");
    csrfToken = res.data.csrfToken;
    console.log("✅ CSRF token obtained:", csrfToken ? "Success" : "Failed");
    return csrfToken;
  } catch (err) {
    console.error("❌ Failed to get CSRF token:", err);
    csrfToken = null;
    throw err;
  } finally {
    isGettingToken = false;
  }
};

// ✅ Request interceptor to add CSRF token - Enhanced
api.interceptors.request.use(async (config) => {
  // Skip CSRF token for GET requests and CSRF token endpoint
  if (config.method === 'get' || config.url === '/csrf-token') {
    return config;
  }
  
  // Get CSRF token if not available
  if (!csrfToken) {
    try {
      await getCsrfToken();
    } catch (err) {
      console.error("Failed to get CSRF token for request:", err);
      // Continue without token for now
    }
  }
  
  // Add CSRF token to request headers
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
    console.log("🔒 Adding CSRF token to request:", config.url);
  } else {
    console.warn("⚠️ No CSRF token available for request:", config.url);
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// ✅ Response interceptor to handle CSRF errors - Enhanced
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.data?.error === 'CSRF_TOKEN_INVALID') {
      console.log("🔄 CSRF token invalid, clearing and retrying...");
      csrfToken = null;
      
      // Try to get a new token
      try {
        await getCsrfToken();
        console.log("✅ New CSRF token obtained after invalidation");
      } catch (err) {
        console.error("❌ Failed to get new CSRF token:", err);
      }
    }
    return Promise.reject(error);
  }
);

// Attach token to every request
// No need to attach token manually; cookies are sent automatically

// Centralized error handler
const handleError = (error) => {
  if (error.response && error.response.data && error.response.data.msg) {
    throw new Error(error.response.data.msg);
  }
  throw error;
};

// coffees
export const getAllcoffees = async () => {
  try {
    const res = await api.get("/coffees");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getcoffeeById = async (id) => {
  try {
    const res = await api.get(`/coffees/${id}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const createcoffee = async (data) => {
  try {
    const res = await api.post("/coffees", data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const updatecoffee = async (id, data) => {
  try {
    const res = await api.put(`/coffees/${id}`, data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const deletecoffee = async (id) => {
  try {
    const res = await api.delete(`/coffees/${id}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getcoffeeByName = async (name) => {
  try {
    const res = await api.get(`/coffees/search/${name}`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// bookings
export const createBooking = async (data) => {
  try {
    const res = await api.post("/bookings", data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getUserBookings = async () => {
  try {
    const res = await api.get("/bookings/my");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getAllBookings = async () => {
  try {
    const res = await api.get("/bookings");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const res = await api.put(`/bookings/${id}`, { status });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// users
export const getProfile = async () => {
  try {
    const res = await api.get("/users/profile");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const updateProfile = async (data) => {
  try {
    const res = await api.put("/users/profile", data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getAllUsers = async () => {
  try {
    const res = await api.get("/users");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const blockUser = async (id) => {
  try {
    const res = await api.put(`/users/${id}/block`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const unblockUser = async (id) => {
  try {
    const res = await api.put(`/users/${id}/unblock`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// auth
export const login = async (data) => {
  try {
    const res = await api.post("/auth/login", data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const refresh = async () => {
  try {
    const res = await api.post("/auth/refresh");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const logout = async () => {
  try {
    const res = await api.post("/auth/logout");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const register = async (data) => {
  try {
    const res = await api.post("/auth/register", data);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// email management
export const addEmail = async (address) => {
  try {
    const res = await api.post("/users/emails", { address });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const verifyEmail = async (token) => {
  try {
    const res = await api.post("/users/emails/verify", { token });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const removeEmail = async (address) => {
  try {
    const res = await api.delete("/users/emails", { data: { address } });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// 2FA backup codes
export const generateBackupCodes = async () => {
  try {
    const res = await api.post("/users/2fa/backup");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const getBackupCodesCount = async () => {
  try {
    const res = await api.get("/users/2fa/backup");
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const useBackupCode = async (code, userId) => {
  try {
    const res = await api.post("/auth/2fa/backup", { code, userId });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export default api;
