import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { setAuthToken as setApiAuthToken } from "../services/api";

interface AuthContextType {
  userId: string | null;
  userRole: string | null;
  fullName: string | null;
  profileComplete: boolean;
  assessmentComplete: boolean;
  authToken: string | null;
  setAuthData: (data: {
    userId: string;
    userRole: string;
    fullName: string;
    profileComplete: boolean;
    assessmentComplete?: boolean;
    authToken?: string;
  }) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const setAuthData = (data: {
    userId: string;
    userRole: string;
    fullName: string;
    profileComplete: boolean;
    assessmentComplete?: boolean;
    authToken?: string;
  }) => {
    setUserId(data.userId);
    setUserRole(data.userRole);
    setFullName(data.fullName);
    setProfileComplete(data.profileComplete);
    setAssessmentComplete(data.assessmentComplete ?? false);
    if (data.authToken !== undefined) {
      setAuthToken(data.authToken);
      setApiAuthToken(data.authToken);

      if (data.authToken) {
        AsyncStorage.setItem("authToken", data.authToken).catch((error) => {
          console.warn("Warning saving AsyncStorage token:", error);
        });
      } else {
        AsyncStorage.removeItem("authToken").catch((error) => {
          console.warn("Warning clearing AsyncStorage token:", error);
        });
      }
    }
  };

  const logout = async () => {
    try {
      // Clear auth token from storage
      await AsyncStorage.removeItem("authToken");
    } catch (error) {
      console.warn("Warning clearing AsyncStorage token:", error);
    }

    // Clear token from API client
    setApiAuthToken(null);

    setUserId(null);
    setUserRole(null);
    setFullName(null);
    setProfileComplete(false);
    setAssessmentComplete(false);
    setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userRole,
        fullName,
        profileComplete,
        assessmentComplete,
        authToken,
        setAuthData,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
