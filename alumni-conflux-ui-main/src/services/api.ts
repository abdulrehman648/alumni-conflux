import axios from "axios";
import { Platform } from "react-native";

// API Service Layer - Easy to swap with real backend
// On mobile: use your computer's local IP address (find with ipconfig on Windows)
// On web: use localhost
const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8080/api"
    : "http://192.168.0.110:8080/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export interface UserResponse {
  userId: number;
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  profileComplete?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const authService = {
  login: async (
    emailOrUsername: string,
    password: string,
  ): Promise<UserResponse> => {
    const payload = { emailOrUsername, password };
    console.log("Sending login payload:", JSON.stringify(payload));
    const response = await apiClient.post("/auth/login", payload);
    return response.data;
  },

  signup: async (data: any): Promise<ApiResponse<UserResponse>> => {
    try {
      const response = await apiClient.post("/auth/signup", data);
      return {
        success: true,
        data: response.data,
        message: "Account created successfully",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Sign up failed",
      };
    }
  },

  checkEmail: async (email: string) => {
    try {
      const response = await apiClient.post("/auth/check-email", { email });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Email check failed",
      };
    }
  },

  checkUsername: async (username: string) => {
    try {
      const response = await apiClient.post("/auth/check-username", {
        username,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Username check failed",
      };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await apiClient.post("/auth/verify-otp", { email, otp });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "OTP verification failed",
      };
    }
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const response = await apiClient.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });
    return response.data;
  },
};

// Mentors Service (Alumni Feed)
export const mentorsService = {
  getAll: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get("/alumni");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/alumni/${id}`);
    return response.data;
  },
};

// Jobs Service
export const jobsService = {
  // Feed
  getAll: async (): Promise<any[]> => {
    const response = await apiClient.get("/jobs");
    return response.data;
  },

  // Create (Alumni)
  create: async (userId: number, data: any) => {
    const response = await apiClient.post(`/jobs/${userId}`, data);
    return response.data;
  },

  // Apply
  apply: async (jobId: number, userId: number, data: any) => {
    const response = await apiClient.post(
      `/jobs/${jobId}/apply/${userId}`,
      data,
    );
    return response.data;
  },

  // Search
  search: async (title: string) => {
    const response = await apiClient.get("/jobs/search", {
      params: { title },
    });
    return response.data;
  },

  // View Applications (Role-based: only poster/admin)
  getApplications: async (jobId: number, userId: number): Promise<any[]> => {
    const response = await apiClient.get(
      `/jobs/${jobId}/applications/${userId}`,
    );
    // Handle both direct array response and wrapped response
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (
      response.data?.applications &&
      Array.isArray(response.data.applications)
    ) {
      return response.data.applications;
    }
    return [];
  },

  // View My Applications
  getMyApplications: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get(`/jobs/applications/my/${userId}`);
    return response.data;
  },
};

// Events Service
export const eventsService = {
  // Feed
  getAll: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get(`/events/available/${userId}`);
    return response.data;
  },

  // Request Creation
  request: async (userId: number, data: any) => {
    const response = await apiClient.post(`/events/request/${userId}`, data);
    return response.data;
  },

  // Register
  register: async (eventId: number, userId: number) => {
    const response = await apiClient.post(
      `/events/${eventId}/register/${userId}`,
    );
    return response.data;
  },

  // View Attendees (Role-based: only creator/admin)
  getAttendees: async (eventId: number, userId: number) => {
    const response = await apiClient.get(
      `/events/${eventId}/attendees/${userId}`,
    );
    return response.data;
  },

  // View My Registrations
  getMyRegistrations: async (userId: number) => {
    const response = await apiClient.get(`/events/registered/${userId}`);
    return response.data;
  },
};

// Users/Profile Service
export const profileService = {
  getStudentProfile: async (userId: number) => {
    const response = await apiClient.get(`/student/${userId}`);
    return response.data;
  },

  getAlumniProfile: async (userId: number) => {
    const response = await apiClient.get(`/alumni/${userId}`);
    return response.data;
  },

  updateStudentProfile: async (userId: number, data: any) => {
    const response = await apiClient.put(`/student/${userId}`, data);
    return response.data;
  },

  updateAlumniProfile: async (userId: number, data: any) => {
    const response = await apiClient.put(`/alumni/${userId}`, data);
    return response.data;
  },

  saveStudentProfile: async (userId: number, data: any) => {
    const response = await apiClient.post(`/student/${userId}`, data);
    return response.data;
  },

  saveAlumniProfile: async (userId: number, data: any) => {
    const response = await apiClient.post(`/alumni/${userId}`, data);
    return response.data;
  },
};

// Admin Service
export const adminService = {
  // Get all users
  getAllUsers: async (): Promise<any[]> => {
    const response = await apiClient.get("/admin/users");
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    if (response.data?.users && Array.isArray(response.data.users)) {
      return response.data.users;
    }
    return [];
  },

  // Delete user
  deleteUser: async (userId: number) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Update user
  updateUser: async (userId: number, data: any) => {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return response.data;
  },
};
