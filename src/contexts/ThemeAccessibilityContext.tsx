import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeAccessibilityContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  colorBlindMode: boolean;
  toggleColorBlindMode: () => void;
  keyboardNavigation: boolean;
  toggleKeyboardNavigation: () => void;
}

const ThemeAccessibilityContext = createContext<ThemeAccessibilityContextType | undefined>(undefined);

export const ThemeAccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('highContrast');
    return saved === 'true';
  });
  const [fontSize, setFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('fontSize');
    return saved ? parseInt(saved) : 100;
  });
  const [colorBlindMode, setColorBlindMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('colorBlindMode');
    return saved === 'true';
  });
  const [keyboardNavigation, setKeyboardNavigation] = useState<boolean>(() => {
    const saved = localStorage.getItem('keyboardNavigation');
    return saved === 'true';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('highContrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.classList.toggle('color-blind', colorBlindMode);
    localStorage.setItem('colorBlindMode', colorBlindMode.toString());
  }, [colorBlindMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('keyboard-navigation', keyboardNavigation);
    localStorage.setItem('keyboardNavigation', keyboardNavigation.toString());
  }, [keyboardNavigation]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 10, 150));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 10, 80));
  };

  const resetFontSize = () => {
    setFontSize(100);
  };

  const toggleColorBlindMode = () => {
    setColorBlindMode((prev) => !prev);
  };

  const toggleKeyboardNavigation = () => {
    setKeyboardNavigation((prev) => !prev);
  };

  return (
    <ThemeAccessibilityContext.Provider
      value={{
        theme,
        toggleTheme,
        highContrast,
        toggleHighContrast,
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        colorBlindMode,
        toggleColorBlindMode,
        keyboardNavigation,
        toggleKeyboardNavigation,
      }}
    >
      {children}
    </ThemeAccessibilityContext.Provider>
  );
};

export const useThemeAccessibility = () => {
  const context = useContext(ThemeAccessibilityContext);
  if (!context) {
    throw new Error('useThemeAccessibility must be used within a ThemeAccessibilityProvider');
  }
  return context;
};