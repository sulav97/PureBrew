import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

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
    const res = await api.get(`/coffees/name/${encodeURIComponent(name)}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// Bookings
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
    const res = await api.patch(`/bookings/${id}/status`, { status });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Users
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
    const res = await api.patch(`/users/${id}/block`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

export const unblockUser = async (id) => {
  try {
    const res = await api.patch(`/users/${id}/unblock`);
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// Auth
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

// Email management
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
    const res = await api.get(`/users/emails/verify/${token}`);
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

// 2FA Backup Codes
export const generateBackupCodes = async () => {
  try {
    const res = await api.post("/users/2fa/backup/generate");
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
    const res = await api.post("/users/2fa/backup/use", { code, userId });
    return res.data;
  } catch (err) {
    handleError(err);
  }
};

// ✅ Add this at the very end for default import support
export default api;
