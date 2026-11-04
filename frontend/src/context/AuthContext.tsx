import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginPayload, UserRole, CampusOnboardPayload, RegisterInvitedPayload } from '../types';
import { canopyApi, setAuthToken } from '../utils/apiClient';

interface AuthContextType {
  user: User | null;
  campusId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  onboardCampus: (payload: CampusOnboardPayload) => Promise<User>;
  registerInvited: (payload: RegisterInvitedPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on app boot
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await canopyApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await canopyApi.login(payload);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const onboardCampus = async (payload: CampusOnboardPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await canopyApi.onboardCampus(payload);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const registerInvited = async (payload: RegisterInvitedPayload): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await canopyApi.registerInvited(payload);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await canopyApi.logout();
    } catch (err) {
      console.warn('[CANOPY AUTH] Logout error:', err);
    } finally {
      setUser(null);
      setAuthToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        campusId: user?.campus_id || null,
        role: user ? (user.role as UserRole) : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        onboardCampus,
        registerInvited,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
