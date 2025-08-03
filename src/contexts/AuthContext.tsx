'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  index: string;
  name: string;
  nameWithInitials: string;
  universityEmail: string;
  batch: string;
  education: {
    faculty: string;
    department: string;
    degreeProgramme: string;
  };
  isVerified: boolean;
  jobSearchingStatus: string;
  profilePicUrl?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-refresh token every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        refreshToken();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user]);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      const response = await fetch('/api/auth/undergraduate/me', {
        credentials: 'include',
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      } else if (response.status === 401) {
        // Try to refresh token
        const refreshSuccess = await refreshToken();
        if (!refreshSuccess) {
          // Clear any stored tokens
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/undergraduate/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          universityEmail: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        // Store access token in memory or localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await fetch('/api/auth/undergraduate/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.data.user);
        // Store access token
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/undergraduate/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/undergraduate/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', data.data.accessToken);
        }
        return true;
      } else {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
        }
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
