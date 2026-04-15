import axios from "axios";
import { Platform } from "react-native";
import { AccountDetails, Campaign, Contribution } from "../types/models";

export { AccountDetails, Campaign, Contribution };

const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8080/api"
    : "http://10.96.41.236:8080/api";

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
  profilePicture?: string;
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
      const errorData = error.response?.data;
      return {
        success: false,
        message:
          errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          errorData?.details ||
          (typeof errorData === "string" ? errorData : null) ||
          "Sign up failed",
      };
    }
  },

  checkEmail: async (email: string) => {
    try {
      const response = await apiClient.post("/auth/check-email", { email });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const errorData = error.response?.data;
      return {
        success: false,
        message:
          errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          errorData?.details ||
          (typeof errorData === "string" ? errorData : null) ||
          "Email check failed",
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
      const errorData = error.response?.data;
      console.error("Username check error:", {
        status: error.response?.status,
        errorData,
        fullError: error,
      });
      return {
        success: false,
        message:
          errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          errorData?.details ||
          (typeof errorData === "string" ? errorData : null) ||
          "Username check failed",
      };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await apiClient.post("/auth/verify-otp", { email, otp });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const errorData = error.response?.data;
      return {
        success: false,
        message:
          errorData?.message ||
          errorData?.error ||
          errorData?.detail ||
          errorData?.details ||
          (typeof errorData === "string" ? errorData : null) ||
          "OTP verification failed",
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

  // GET PENDING REQUESTS (Admin)
  getPending: async () => {
    const response = await apiClient.get("/events/pending");
    return response.data;
  },

  // UPDATE STATUS (Admin)
  updateStatus: async (eventId: number, status: string) => {
    const response = await apiClient.patch(`/events/${eventId}/status`, null, {
      params: { status },
    });
    return response.data;
  },

  // UPDATE EVENT DETAILS (Admin)
  updateEvent: async (eventId: number, userId: number, data: any) => {
    const response = await apiClient.put(
      `/events/${eventId}/update/${userId}`,
      data,
    );
    return response.data;
  },

  getEventsCreatedByUser: async (userId: number) => {
    const response = await apiClient.get(`/events/creator/${userId}`);
    return response.data;
  },
};

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

  uploadProfilePicture: async (userId: number, photo: any) => {
    const formData = new FormData();
    formData.append("file", photo);

    const response = await apiClient.post(
      `/user/${userId}/profile-picture`,
      formData,
    );
    return response.data;
  },
};

export const adminService = {
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

// Mentorship Service
export const mentorshipService = {
  getAvailableMentors: async (): Promise<any[]> => {
    const response = await apiClient.get("/mentorship/mentors");
    return response.data;
  },

  updateAvailability: async (userId: number, isAvailable: boolean) => {
    const response = await apiClient.put(
      `/mentorship/availability/${userId}`,
      null,
      {
        params: { isAvailable },
      },
    );
    return response.data;
  },

  requestMentorship: async (
    userId: number,
    alumniId: number,
    message: string = "",
  ) => {
    const response = await apiClient.post(
      `/mentorship/request/${userId}/${alumniId}`,
      null,
      {
        params: { message },
      },
    );
    return response.data;
  },

  getReceivedRequests: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get(
      `/mentorship/requests/received/${userId}`,
    );
    return response.data;
  },

  getSentRequests: async (userId: number): Promise<any[]> => {
    const response = await apiClient.get(`/mentorship/requests/sent/${userId}`);
    return response.data;
  },

  updateRequestStatus: async (
    requestId: number,
    userId: number,
    status: string,
  ) => {
    const response = await apiClient.put(
      `/mentorship/requests/${requestId}/status/${userId}`,
      null,
      {
        params: { status },
      },
    );
    return response.data;
  },
};

// Donations & Funds Service
export const donationsService = {
  // Admin: Create Campaign
  createCampaign: async (data: any) => {
    const response = await apiClient.post("/admin/campaigns", data);
    return response.data;
  },

  // Admin: View all campaigns (Admin view might show more info if needed, but using shared for now)
  getAllCampaignsAdmin: async (): Promise<Campaign[]> => {
    const response = await apiClient.get("/admin/campaigns");
    return response.data;
  },

  // Admin: View contributions for a campaign
  getContributions: async (campaignId: number): Promise<Contribution[]> => {
    const response = await apiClient.get(
      `/admin/campaigns/${campaignId}/contributions`,
    );
    return response.data;
  },

  verifyContribution: async (
    contributionId: number,
    status: string,
  ): Promise<Contribution> => {
    const response = await apiClient.put(
      `/admin/campaigns/contributions/${contributionId}/verify`,
      null,
      {
        params: { status },
      },
    );
    return response.data;
  },

  getActiveCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiClient.get("/alumni/campaigns");
    return response.data;
  },

  getCampaignById: async (id: number): Promise<Campaign> => {
    const response = await apiClient.get(`/alumni/campaigns/${id}`);
    return response.data;
  },

  submitContribution: async (
    campaignId: number,
    requestData: any,
    screenshot: any,
  ) => {
    const formData = new FormData();
    formData.append("amount", requestData.amount.toString());
    formData.append("alumniId", requestData.alumniId.toString());
    formData.append("transactionId", requestData.transactionId || "");
    formData.append("note", requestData.note || "");
    formData.append("screenshot", screenshot);

    const response = await apiClient.post(
      `/alumni/campaigns/${campaignId}/contribute`,
      formData,
    );
    return response.data;
  },

  getMyContributions: async (alumniId: number): Promise<Contribution[]> => {
    const response = await apiClient.get(
      `/alumni/campaigns/my-contributions/${alumniId}`,
    );
    return response.data;
  },
};

export const aiService = {
  getCareerAdvice: async (userId: number, message: string): Promise<string> => {
    const response = await apiClient.post(
      `/ai/career-advice/${userId}`,
      message,
      {
        headers: { "Content-Type": "text/plain" },
      },
    );
    return response.data;
  },
};
