// User Models
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: "student" | "alumni" | "admin";
  createdAt: string;
}

export interface StudentProfile extends User {
  role: "student";
  yearOfStudy?: number;
  department?: string;
  bio?: string;
}

export interface AlumniProfile extends User {
  role: "alumni";
  designation: string;
  company: string;
  bio?: string;
  skills?: string[];
  yearsOfExperience: number;
}

export interface AdminProfile extends User {
  role: "admin";
  permissions: string[];
}

// Mentor Models
export interface Mentor extends User {
  designation: string;
  company: string;
  skills: string[];
  rating: number;
  totalStudents: number;
  bio?: string;
  availability?: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface MentorRequest {
  id: string;
  mentorId: string;
  studentId: string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt: string;
}

// Job Models
export interface Job {
  id: string;
  title: string;
  company: string;
  description?: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary?: string;
  skills?: string[];
  applicantsCount: number;
  createdAt: string;
  postedBy: string; // Alumni ID
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string;
  status: "pending" | "accepted" | "rejected";
  appliedAt: string;
}

// Event Models
export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date
  time: string; // HH:MM format
  location: string;
  category: "Webinar" | "Workshop" | "Networking" | "Seminar";
  attendeesCount: number;
  capacity?: number;
  organizer: string; // Alumni ID
  image?: string;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: "registered" | "attended" | "cancelled";
}

// Session Models
export interface MentorSession {
  id: string;
  mentorId: string;
  studentId: string;
  title: string;
  description?: string;
  scheduledAt: string; // ISO datetime
  duration: number; // minutes
  topic: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  feedback?: {
    rating: number;
    comment?: string;
  };
  createdAt: string;
}

// Authentication Models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  role: "student" | "alumni" | "admin";
}

export interface SignupResponse {
  id: string;
  email: string;
  name: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetVerify {
  email: string;
  code: string;
}

export interface PasswordResetChange {
  email: string;
  code: string;
  newPassword: string;
}

// Pagination & Filtering
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

// Search & Filter Models
export interface SearchQuery {
  q: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  sortBy?: "relevance" | "recent" | "popular" | "rating";
  dateRange?: {
    from: string;
    to: string;
  };
  location?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

// Donation & Campaign Models
export interface AccountDetails {
  accountName: string;
  accountNumber: string;
  iban: string;
  bankName: string;
}

export interface Campaign {
  id: number;
  title: string;
  description: string;
  type: "DONATION" | "FUND";
  accountDetails: AccountDetails;
  targetAmount: number;
  collectedAmount: number;
  deadline: string;
  createdBy: string;
  createdAt: string;
}

export interface Contribution {
  id: number;
  campaignId: number;
  campaignTitle: string;
  alumniName: string;
  amount: number;
  screenshotUrl: string;
  transactionId?: string;
  note?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  submittedAt: string;
  verifiedAt?: string;
}
