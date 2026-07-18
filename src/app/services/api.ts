import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor (noop as cookies are sent automatically)
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response Interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("parkhere_user");
    }
    return Promise.reject(error);
  }
);

// ─── AUTH SERVICES ──────────────────────────────────────────────────────────
export const authService = {
  register: async (payload: any) => {
    const res = await api.post("/auth/register", payload);
    return res.data;
  },
  verifyEmail: async (email: string, otp: string) => {
    const res = await api.post(`/auth/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`);
    return res.data;
  },
  login: async (payload: any) => {
    const res = await api.post("/auth/login", payload);
    if (res.data && res.data.user) {
      localStorage.setItem("parkhere_user", JSON.stringify(res.data.user));
    }
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    return res.data;
  },
  resetPassword: async (token: string, pass: string) => {
    const res = await api.post(`/auth/reset-password?token=${encodeURIComponent(token)}&password=${encodeURIComponent(pass)}`);
    return res.data;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Backend logout failed:", e);
    }
    localStorage.removeItem("parkhere_user");
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem("parkhere_user");
    return userStr ? JSON.parse(userStr) : null;
  }
};

// ─── VEHICLE SERVICES ────────────────────────────────────────────────────────
export const vehicleService = {
  getMyVehicles: async () => {
    const res = await api.get("/vehicles");
    return res.data;
  },
  addVehicle: async (payload: any) => {
    const res = await api.post("/vehicles", payload);
    return res.data;
  },
  deleteVehicle: async (id: number) => {
    const res = await api.delete(`/vehicles/${id}`);
    return res.data;
  }
};

// ─── PARKING LOT SERVICES ───────────────────────────────────────────────────
export const lotService = {
  searchLots: async (search?: string) => {
    const url = search ? `/lots?search=${encodeURIComponent(search)}` : "/lots";
    const res = await api.get(url);
    return res.data;
  },
  getLotDetails: async (id: number) => {
    const res = await api.get(`/lots/${id}`);
    return res.data;
  },
  getLotFloors: async (id: number) => {
    const res = await api.get(`/lots/${id}/floors`);
    return res.data;
  },
  getSlotsAvailability: async (floorId: number, startTime: string, endTime: string) => {
    const res = await api.get(`/lots/floors/${floorId}/slots?startTime=${startTime}&endTime=${endTime}`);
    return res.data;
  }
};

// ─── BOOKING SERVICES ────────────────────────────────────────────────────────
export const bookingService = {
  createBooking: async (payload: any) => {
    const res = await api.post("/bookings", payload);
    return res.data;
  },
  getMyBookings: async () => {
    const res = await api.get("/bookings");
    return res.data;
  },
  getBookingDetails: async (id: number) => {
    const res = await api.get(`/bookings/${id}`);
    return res.data;
  },
  cancelBooking: async (id: number) => {
    const res = await api.post(`/bookings/${id}/cancel`);
    return res.data;
  },
  scanQrCode: async (qrData: string) => {
    const res = await api.post(`/bookings/qr/scan?qrData=${encodeURIComponent(qrData)}`);
    return res.data;
  }
};

// ─── NOTIFICATION SERVICES ───────────────────────────────────────────────────
export const notificationService = {
  getMyNotifications: async () => {
    const res = await api.get("/notifications");
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data;
  },
  markAsRead: async (id: number) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.put("/notifications/read-all");
    return res.data;
  }
};

// ─── ADMIN SERVICES ──────────────────────────────────────────────────────────
export const adminService = {
  getDashboardMetrics: async () => {
    const res = await api.get("/admin/dashboard");
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await api.get("/admin/audit-logs");
    return res.data;
  }
};
