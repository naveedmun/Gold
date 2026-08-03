import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'light'; } catch { return 'light'; }
  });
  const [autoRefresh, setAutoRefresh] = useState(() => {
    try { return parseInt(localStorage.getItem('autoRefresh') || '0'); } catch { return 0; }
  });
  const [favoriteMetal, setFavoriteMetal] = useState(() => {
    try { return localStorage.getItem('favoriteMetal') || 'gold'; } catch { return 'gold'; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem('autoRefresh', String(autoRefresh)); } catch (e) {}
  }, [autoRefresh]);

  useEffect(() => {
    try { localStorage.setItem('favoriteMetal', favoriteMetal); } catch (e) {}
  }, [favoriteMetal]);

  return (
    <SettingsContext.Provider value={{
      theme, setTheme,
      autoRefresh, setAutoRefresh,
      favoriteMetal, setFavoriteMetal
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    return {
      theme: 'light', setTheme: () => {},
      autoRefresh: 0, setAutoRefresh: () => {},
      favoriteMetal: 'gold', setFavoriteMetal: () => {}
    };
  }
  return ctx;
}