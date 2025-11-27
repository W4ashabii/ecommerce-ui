'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi, settingsApi } from './api';

type Mode = 'dark' | 'light';
type WebsiteTheme = 'floral' | 'summer' | 'winter' | 'monsoon' | 'classy' | 'monochrome';

interface ThemeContextType {
  mode: Mode;
  websiteTheme: WebsiteTheme;
  toggleMode: () => void;
  setMode: (mode: Mode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  websiteTheme: 'floral',
  toggleMode: () => {},
  setMode: () => {},
});

const MODE_COOKIE = 'ami_mode';

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Helper to set cookie
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Lax`;
}

interface ThemeProviderProps {
  children: ReactNode;
  userTheme?: Mode;
  isAuthenticated?: boolean;
}

export function ThemeProvider({ children, userTheme, isAuthenticated }: ThemeProviderProps) {
  const [mode, setModeState] = useState<Mode>('dark');
  const [mounted, setMounted] = useState(false);

  // Fetch website theme from settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 60 * 1000, // 1 minute
  });

  const websiteTheme: WebsiteTheme = settings?.websiteTheme || 'floral';

  // Load mode on mount
  useEffect(() => {
    if (userTheme) {
      setModeState(userTheme);
    } else {
      const cookieMode = getCookie(MODE_COOKIE) as Mode | null;
      if (cookieMode === 'light' || cookieMode === 'dark') {
        setModeState(cookieMode);
      }
    }
    setMounted(true);
  }, [userTheme]);

  // Sync with user theme when it changes
  useEffect(() => {
    if (mounted && userTheme) {
      setModeState(userTheme);
    }
  }, [userTheme, mounted]);

  // Apply theme classes to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('dark', 'light', 'floral', 'summer', 'winter', 'monsoon', 'classy', 'monochrome');
    
    // Add website theme class
    root.classList.add(websiteTheme);
    
    // Add mode class
    root.classList.add(mode);
    
    // Save mode to cookie
    setCookie(MODE_COOKIE, mode);
  }, [mode, websiteTheme, mounted]);

  const setMode = useCallback(async (newMode: Mode) => {
    setModeState(newMode);
    setCookie(MODE_COOKIE, newMode);
    
    // If authenticated, also save to user profile
    if (isAuthenticated) {
      try {
        await authApi.updateTheme(newMode);
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  }, [isAuthenticated]);

  const toggleMode = useCallback(() => {
    const newMode = mode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [mode, setMode]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ mode, websiteTheme, toggleMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Backward compatibility - alias for mode
export const useMode = useTheme;
