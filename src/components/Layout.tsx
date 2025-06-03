import React, { useState, useEffect, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import AccessibilityMenu from '../components/AccessibilityMenu';
import AccessibilityControls from '../components/AccessibilityControls';

// Theme Context
interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Accessibility Context
interface AccessibilityContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  toggleHighContrast: () => void;
  ttsEnabled: boolean;
  toggleTts: () => void;
}

export const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    );
  }
  return context;
};

const Layout = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [fontSize, setFontSize] = useState<number>(16);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(false);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const toggleTts = () => {
    setTtsEnabled((prev) => {
      if (prev) {
        window.speechSynthesis.cancel();
      }
      return !prev;
    });
  };

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [fontSize, highContrast]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AccessibilityContext.Provider
        value={{
          fontSize,
          highContrast,
          toggleHighContrast,
          setFontSize,
          setHighContrast,
          ttsEnabled,
          toggleTts,
        }}
      >
        <div
          className={`min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)] transition-colors duration-300`}
        >
          {/* Estilos globais para tema claro */}
          {theme === 'light' && (
            <style>
              {`
                :root {
                  --background: #fafafae1;
                  --text: #333333;
                }
                .light main,
                .light div,
                .light section,
                .light article,
                .light aside,
                .light nav,
                .light footer {
                  background: var(--background) !important;
                  background-image: none !important;
                }
                .light p,
                .light h1,
                .light h2,
                .light h3,
                .light h4,
                .light h5,
                .light h6,
                .light span,
                .light a,
                .light li,
                .light label {
                  color: var(--text) !important;
                }
                .light button,
                .light input,
                .light textarea {
                  background: var(--background) !important;
                  color: var(--text) !important;
                  border-color: var(--primary) !important;
                  background-image: none !important;
                }
                .light svg {
                  stroke: var(--primary) !important;
                }
                .light img:not(.profile-image) {
                  filter: brightness(1.2) contrast(1.1) !important;
                }
              `}
            </style>
          )}
          {/* Estilos globais para alto contraste */}
          {highContrast && (
            <style>
              {`
                .high-contrast main,
                .high-contrast div,
                .high-contrast section,
                .high-contrast article,
                .high-contrast aside,
                .high-contrast nav,
                .high-contrast footer {
                  background: var(--background) !important;
                  background-image: none !important;
                }
                .high-contrast p,
                .high-contrast h1,
                .high-contrast h2,
                .high-contrast h3,
                .high-contrast h4,
                .high-contrast h5,
                .high-contrast h6,
                .high-contrast span,
                .high-contrast a,
                .high-contrast li,
                .high-contrast label {
                  color: var(--text) !important;
                }
                .high-contrast button,
                .high-contrast input,
                .high-contrast textarea {
                  background: var(--background) !important;
                  color: var(--text) !important;
                  border-color: var(--primary) !important;
                }
                .high-contrast svg {
                  stroke: var(--primary) !important;
                }
              `}
            </style>
          )}
          <NavBar />
          <Outlet />
          <Footer />
          <div className="fixed bottom-4 right-4 z-50 space-y-3">
            <AccessibilityMenu />
            <AccessibilityControls />
          </div>
        </div>
      </AccessibilityContext.Provider>
    </ThemeContext.Provider>
  );
};

export default Layout;