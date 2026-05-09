import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColors {
  color1: string; // Dark text/background
  color2: string; // Primary
  color3: string; // Secondary
  color4: string; // Accent
  color5: string; // Glow/Highlight
  logoUrl?: string;
  municipioNome?: string;
}

interface ThemeContextType {
  theme: ThemeColors;
  setTheme: (theme: Partial<ThemeColors>) => void;
  resetToCentral: () => void;
}

const defaultCentralTheme: ThemeColors = {
  color1: '#3a3132',
  color2: '#0f4571',
  color3: '#386dbd',
  color4: '#009ddd',
  color5: '#05d3f8',
  municipioNome: 'A Central',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeColors>(() => {
    const saved = localStorage.getItem('gei-theme');
    return saved ? JSON.parse(saved) : defaultCentralTheme;
  });

  useEffect(() => {
    localStorage.setItem('gei-theme', JSON.stringify(theme));
    // Aplica as variáveis CSS dinamicamente no :root (HTML)
    const root = document.documentElement;
    root.style.setProperty('--theme-color-1', theme.color1);
    root.style.setProperty('--theme-color-2', theme.color2);
    root.style.setProperty('--theme-color-3', theme.color3);
    root.style.setProperty('--theme-color-4', theme.color4);
    root.style.setProperty('--theme-color-5', theme.color5);
  }, [theme]);

  const setTheme = (newTheme: Partial<ThemeColors>) => {
    setThemeState((prev) => ({ ...prev, ...newTheme }));
  };

  const resetToCentral = () => {
    setThemeState(defaultCentralTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetToCentral }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
