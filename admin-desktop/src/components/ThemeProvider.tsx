import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
export function ThemeProvider({ children }: {children: React.ReactNode;}) {
  const themeMode = useSelector((state: RootState) => state.theme.mode);
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    if (themeMode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').
      matches ?
      'dark' :
      'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(themeMode);
    }
  }, [themeMode]);
  return <>{children}</>;
}