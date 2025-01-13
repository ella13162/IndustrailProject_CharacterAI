import { DefaultTheme } from 'styled-components';

export interface ThemeInterface {
  buttons: {
    primary: {
      background: string;
      color: string;
      hover: string;
    };
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
    text: {
      primary: string;
      secondary: string;
      inverse: string;
    };
  };
  typography: {
    fontFamily: string;
    monoFontFamily: string;
    weights: {
      regular: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      h1: string;
      h2: string;
      body: string;
    };
    lineHeights: {
      none: number;
      tight: number;
      snug: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
  };
  spacing: {
    '0': string;
    '1': string;
    '2': string;
    '3': string;
    '4': string;
    '5': string;
    '6': string;
    '8': string;
    '10': string;
    '12': string;
    '16': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  shadows: {
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
  };
  transitions: {
    fast: string;
    base: string;
    slow: string;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

export const lightTheme: ThemeInterface = {
  buttons: {
    primary: {
      background: '#5b32c7',
      color: '#ffffff',
      hover: '#4a29a3'
    }
  },
  colors: {
    primary: '#5b32c7', // purple
    secondary: '#fe6602', // orange
    background: '#ffffff',
    surface: '#ffffff',
    border: '#d0d5dd',
    error: '#dc2626',
    warning: '#f59e0b',
    success: '#10b981',
    info: '#3b82f6',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      inverse: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    monoFontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    sizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '2rem',     // 32px
      '4xl': '3rem',     // 48px
      h1: '3rem',        // 48px
      h2: '2rem',        // 32px
      body: '1rem',      // 16px
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',   // 4px
    '2': '0.5rem',    // 8px
    '3': '0.75rem',   // 12px
    '4': '1rem',      // 16px
    '5': '1.25rem',   // 20px
    '6': '1.5rem',    // 24px
    '8': '2rem',      // 32px
    '10': '2.5rem',   // 40px
    '12': '3rem',     // 48px
    '16': '4rem',     // 64px
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',    // 2px
    base: '0.25rem',   // 4px
    md: '0.375rem',    // 6px
    lg: '0.5rem',      // 8px
    xl: '0.75rem',     // 12px
    '2xl': '1rem',     // 16px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '0.15s ease-in-out',
    base: '0.3s ease-in-out',
    slow: '0.5s ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export const darkTheme: ThemeInterface = {
  ...lightTheme,
  buttons: {
    primary: {
      background: '#5b32c7',
      color: '#ffffff',
      hover: '#4a29a3'
    }
  },
  colors: {
    ...lightTheme.colors,
    background: '#111827',
    surface: '#1f2937',
    border: '#374151',
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
      inverse: '#111827',
    },
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
  },
};

export default lightTheme;