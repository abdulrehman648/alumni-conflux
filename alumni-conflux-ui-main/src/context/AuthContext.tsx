import React, { createContext, ReactNode, useContext, useState } from "react";

interface AuthContextType {
  userId: string | null;
  userRole: string | null;
  fullName: string | null;
  profileComplete: boolean;
  setAuthData: (data: {
    userId: string;
    userRole: string;
    fullName: string;
    profileComplete: boolean;
  }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  const setAuthData = (data: {
    userId: string;
    userRole: string;
    fullName: string;
    profileComplete: boolean;
  }) => {
    setUserId(data.userId);
    setUserRole(data.userRole);
    setFullName(data.fullName);
    setProfileComplete(data.profileComplete);
  };

  const logout = () => {
    setUserId(null);
    setUserRole(null);
    setFullName(null);
    setProfileComplete(false);
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        userRole,
        fullName,
        profileComplete,
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
