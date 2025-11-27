'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { authApi, User } from './api';
import { useConfig } from './config';

interface AuthContextType {
  user: User | null;
  /** @deprecated Token is now stored in HTTP-only cookie. This always returns null. */
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: () => void;
  signOut: () => void;
  handleCallback: (code: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAdmin: false,
  signIn: () => {},
  signOut: () => {},
  handleCallback: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { config, isLoading: configLoading } = useConfig();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || 
    (config?.allowedAdminEmails?.includes(user?.email?.toLowerCase() || '') ?? false);

  // Fetch current user from API (uses HTTP-only cookie)
  const refreshUser = useCallback(async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      // Not authenticated or token expired
      setUser(null);
    }
  }, []);

  // Load user on mount by checking cookie via API
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const userData = await authApi.getMe();
        setUser(userData);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle OAuth callback - exchange code for token (sets HTTP-only cookie)
  const handleCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.exchangeCode(code);
      setUser(result.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in - redirect to Google OAuth
  const signIn = useCallback(async () => {
    try {
      const { url } = await authApi.getGoogleAuthUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  }, []);

  // Sign out - clears HTTP-only cookie via API
  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null, // Deprecated: token is now in HTTP-only cookie
        isLoading: isLoading || configLoading,
        isAdmin,
        signIn,
        signOut,
        handleCallback,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
