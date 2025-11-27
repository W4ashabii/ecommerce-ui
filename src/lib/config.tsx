'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { configApi, AppConfig } from './api';

interface ConfigContextType {
  config: AppConfig | null;
  isLoading: boolean;
  error: Error | null;
}

const ConfigContext = createContext<ConfigContextType>({
  config: null,
  isLoading: true,
  error: null,
});

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    configApi
      .get()
      .then(setConfig)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

// Helper to check if email is admin
export function isAdminEmail(email: string, allowedEmails: string[]): boolean {
  return allowedEmails.includes(email.toLowerCase());
}

