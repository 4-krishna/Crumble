import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  palette: {
    primary: {
      main: '#2B6CB0',
      light: '#4299E1',
      dark: '#2C5282',
    },
    secondary: {
      main: '#553C9A',
      light: '#6B46C1',
      dark: '#44337A',
    },
    background: {
      default: '#F7FAFC',
      paper: 'rgba(255, 255, 255, 0.95)',
    },
    text: {
      primary: '#2D3748',
      secondary: '#4A5568',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Oxanium:wght@200..800&display=swap');
      `,
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          padding: '10px 24px',
          boxShadow: 'none',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 500,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.08)',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#2D3748',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        },
        h2: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        },
        h3: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          letterSpacing: '-0.02em',
        },
        h4: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        },
        h5: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
        },
        h6: {
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
        },
        body1: {
          fontFamily: '"DM Sans", sans-serif',
          lineHeight: 1.6,
        },
        body2: {
          fontFamily: '"DM Sans", sans-serif',
          lineHeight: 1.6,
        },
      },
    },
  },
});

export default theme;