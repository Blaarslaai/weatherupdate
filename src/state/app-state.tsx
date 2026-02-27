import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppLocation, AppStateContextValue } from './state-types';

const DEFAULT_LOCATION: AppLocation = {
  city: 'Pretoria',
  country: 'ZA',
};

const STORAGE_KEY = 'weatherupdate.app.location';

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [location, setLocationState] = useState<AppLocation>(DEFAULT_LOCATION);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AppLocation>;
      if (typeof parsed.city === 'string' && typeof parsed.country === 'string') {
        setLocationState({
          city: parsed.city.trim() || DEFAULT_LOCATION.city,
          country: parsed.country.trim().toUpperCase() || DEFAULT_LOCATION.country,
        });
      }
    } catch {
      // Ignore bad persisted state.
    }
  }, []);

  const setLocation = (next: AppLocation) => {
    const normalized = {
      city: next.city.trim(),
      country: next.country.trim().toUpperCase(),
    };
    setLocationState(normalized);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Ignore storage write failures.
    }
  };

  const value = useMemo(() => ({ location, setLocation }), [location]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
