import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { lightTheme, darkTheme, ThemeInterface } from '../styles/theme';

type ColorMode = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: ThemeInterface;
  isDarkMode: boolean;
  toggleTheme: () => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
  colorMode: 'system',
  setColorMode: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize with system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDarkMode, setIsDarkMode] = useState(prefersDark);
  const [colorMode, setColorMode] = useState<ColorMode>('system');
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useAuth();

  // Reset to default values when user logs out
  const resetToDefaults = () => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setColorMode('system');
    setFontSize('medium');
    setIsDarkMode(prefersDark);
    localStorage.removeItem('theme');
    localStorage.removeItem('fontSize');
  };

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (colorMode === 'system') {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // Load user preferences if logged in, otherwise use local storage
    const loadPreferences = async () => {
      setIsLoading(true);
      
      try {
        if (currentUser) {
          // For logged-in users, always use Firestore preferences
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const preferences = userData.preferences || {};
            
            // Apply theme preference
            if (preferences.theme === 'dark') {
              setColorMode('dark');
              setIsDarkMode(true);
            } else if (preferences.theme === 'light') {
              setColorMode('light');
              setIsDarkMode(false);
            } else {
              setColorMode('system');
              setIsDarkMode(prefersDark);
            }
            
            // Apply font size preference
            if (preferences.fontSize) {
              setFontSize(preferences.fontSize);
            }
          } else {
            // Create default preferences for new users
            await setDoc(userRef, {
              preferences: {
                colorMode: 'system',
                fontSize: 'medium'
              }
            });
            resetToDefaults();
          }
        } else {
          // Use local storage for non-logged-in users
          const storedTheme = localStorage.getItem('theme');
          const storedFontSize = localStorage.getItem('fontSize');
          
          if (storedTheme === 'dark') {
            setColorMode('dark');
            setIsDarkMode(true);
          } else if (storedTheme === 'light') {
            setColorMode('light');
            setIsDarkMode(false);
          } else {
            setColorMode('system');
            setIsDarkMode(prefersDark);
          }
          
          if (storedFontSize) {
            setFontSize(storedFontSize as FontSize);
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        resetToDefaults();
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [currentUser]);

  interface Preferences {
    colorMode?: ColorMode;
    fontSize?: FontSize;
    theme?: 'light' | 'dark';
  }

  const savePreferences = async (preferences: Preferences) => {
    if (!currentUser) return;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(userRef, {
          ...userDoc.data(),
          preferences: {
            ...userDoc.data().preferences,
            ...preferences,
          },
        }, { merge: true });
      } else {
        await setDoc(userRef, {
          preferences,
        });
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Update isDarkMode based on colorMode and system preference
  const updateIsDarkMode = (mode: ColorMode) => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (mode === 'dark') {
      setIsDarkMode(true);
    } else if (mode === 'light') {
      setIsDarkMode(false);
    } else {
      setIsDarkMode(prefersDark);
    }
  };

  // Handle color mode changes
  const handleSetColorMode = async (mode: ColorMode) => {
    // Update state immediately
    setColorMode(mode);
    updateIsDarkMode(mode);
    
    // Save to local storage
    if (mode === 'light' || mode === 'dark') {
      localStorage.setItem('theme', mode);
    } else {
      localStorage.removeItem('theme');
    }
    
    // Save to Firestore if logged in
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const currentData = userDoc.exists() ? userDoc.data() : {};
        const currentPrefs = currentData.preferences || {};
        
        const newPrefs = {
          ...currentPrefs,
          colorMode: mode,
          theme: mode === 'light' || mode === 'dark' ? mode : undefined
        };
        
        await setDoc(userRef, {
          ...currentData,
          preferences: newPrefs
        }, { merge: true });
      } catch (error) {
        console.error('Error saving theme preferences:', error);
      }
    }
  };

  // Handle font size changes
  const handleSetFontSize = async (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    
    if (currentUser) {
      await savePreferences({ fontSize: size });
    }
  };

  // Toggle between light and dark mode
  const toggleTheme = async () => {
    console.log('Current theme state:', { isDarkMode, colorMode }); // Debug log
    
    // Always toggle between explicit light and dark modes
    const newMode = isDarkMode ? 'light' : 'dark' as const;
    console.log('Toggling to:', newMode); // Debug log
    
    // Update state immediately for better UX
    setIsDarkMode(!isDarkMode);
    setColorMode(newMode);
    
    // Save preference
    if (currentUser) {
      try {
        const preferences: Preferences = {
          colorMode: newMode,
          theme: newMode
        };
        console.log('Saving preferences:', preferences); // Debug log
        await savePreferences(preferences);
      } catch (error) {
        console.error('Error saving theme preferences:', error);
        // Revert state if save fails
        setIsDarkMode(isDarkMode);
        setColorMode(colorMode);
      }
    }
  };

  // Update isDarkMode when colorMode changes or system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = () => {
      if (colorMode === 'system') {
        updateIsDarkMode('system');
      }
    };

    updateIsDarkMode(colorMode);
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [colorMode]);

  // Apply font size scaling
  const getFontSizeScale = () => {
    switch (fontSize) {
      case 'small':
        return 0.875;
      case 'large':
        return 1.125;
      default:
        return 1;
    }
  };

  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  const scale = getFontSizeScale();

  const theme: ThemeInterface = {
    ...baseTheme,
    typography: {
      ...baseTheme.typography,
      sizes: {
        xs: `${parseFloat(baseTheme.typography.sizes.xs) * scale}rem`,
        sm: `${parseFloat(baseTheme.typography.sizes.sm) * scale}rem`,
        base: `${parseFloat(baseTheme.typography.sizes.base) * scale}rem`,
        lg: `${parseFloat(baseTheme.typography.sizes.lg) * scale}rem`,
        xl: `${parseFloat(baseTheme.typography.sizes.xl) * scale}rem`,
        '2xl': `${parseFloat(baseTheme.typography.sizes['2xl']) * scale}rem`,
        '3xl': `${parseFloat(baseTheme.typography.sizes['3xl']) * scale}rem`,
        '4xl': `${parseFloat(baseTheme.typography.sizes['4xl']) * scale}rem`,
        body: `${parseFloat(baseTheme.typography.sizes.body) * scale}rem`,
        h1: `${parseFloat(baseTheme.typography.sizes.h1) * scale}rem`,
        h2: `${parseFloat(baseTheme.typography.sizes.h2) * scale}rem`,
      },
    },
  };

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        isDarkMode, 
        toggleTheme,
        colorMode,
        setColorMode: handleSetColorMode,
        fontSize,
        setFontSize: handleSetFontSize,
      }}
    >
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
