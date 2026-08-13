import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'deep-space' | 'cyber-light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('deep-space');

  useEffect(() => {
    if (theme === 'cyber-light') {
      document.body.classList.add('cyber-light');
    } else {
      document.body.classList.remove('cyber-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'deep-space' ? 'cyber-light' : 'deep-space'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
