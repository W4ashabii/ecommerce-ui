'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ConfigProvider } from '@/lib/config';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeProvider, useTheme } from '@/lib/theme-context';
import { RainEffect } from '@/components/effects/rain-effect';

// Wrapper to connect auth and theme providers
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  return (
    <ThemeProvider 
      userTheme={user?.theme} 
      isAuthenticated={!!user}
    >
      <ThemeEffects />
      {children}
    </ThemeProvider>
  );
}

// Apply theme-specific effects
function ThemeEffects() {
  const { websiteTheme } = useTheme();
  
  if (websiteTheme === 'monsoon') {
    return <RainEffect />;
  }
  
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <AuthProvider>
          <ThemeWrapper>
            {children}
          </ThemeWrapper>
        </AuthProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

