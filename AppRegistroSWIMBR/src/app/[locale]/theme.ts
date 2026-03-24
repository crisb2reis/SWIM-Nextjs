/**
 * src/app/theme.ts
 * Tema centralizado baseado no Materio (azul navy + acentos vibrantes).
 */
import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

export const getAppTheme = (mode: 'light' | 'dark') => {
  const isLight = mode === 'light';

  return createTheme({
    palette: {
      mode,
      primary: {
        main:          isLight ? '#253865' : '#4a78ff', // Azul Médio / Azul Vibrante
        light:         isLight ? '#80879e' : '#8fa2db', // Cinza Azulado / Azul Claro
        dark:          isLight ? '#121f40' : '#1e3875', // Azul Profundo / Azul Médio Escuro
        contrastText:  '#FFFFFF',
      },
      secondary: {
        main:          isLight ? '#1b2b52' : '#274282', // Azul Escuro / Azul Secundário Claro
        contrastText:  '#FFFFFF',
      },
      background: {
        default: isLight ? '#F5F5F9' : '#0a1226', // Fundo leve / Fundo azul noite
        paper:   isLight ? '#FFFFFF' : '#16223a',
      },
      error:   { main: '#FF3E1D' },
      warning: { main: '#FFAB00' },
      info:    { main: isLight ? '#adb1c3' : '#6b7a99' },
      success: { main: '#71DD37' },
      text: {
        primary:   isLight ? '#121f40' : '#E5E7EB', // Texto principal azul profundo / Branco Suave
        secondary: isLight ? '#80879e' : '#9CA3AF', // Texto secundário cinza azulado / Cinza Claro
      },
      divider: isLight ? '#DBDADE' : '#2c3e60',
    },
    typography: {
      fontFamily: '"Public Sans", "Inter", "Roboto", sans-serif',
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
      body2: { fontSize: '0.875rem' },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { borderRadius: 12, border: `1px solid ${isLight ? '#DBDADE' : '#2c3e60'}` },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        defaultProps: { size: 'small', variant: 'outlined' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isLight ? '#ffffff' : '#1e2b48',
              borderRadius: 8,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: isLight ? '#fdfdfd' : '#243454',
              },
              '&.Mui-focused': {
                backgroundColor: isLight ? '#ffffff' : '#1e2b48',
                boxShadow: isLight ? '0 0 0 2px rgba(37, 56, 101, 0.1)' : '0 0 0 2px rgba(74, 120, 255, 0.3)',
              },
              '& fieldset': {
                borderColor: isLight ? '#DBDADE' : '#2c3e60',
              },
              '&:hover fieldset': {
                borderColor: isLight ? '#80879e !important' : '#4a78ff !important',
              },
            },
            '& .MuiInputLabel-root': {
              color: isLight ? '#80879e' : '#9CA3AF',
              fontWeight: 500,
              '&.Mui-focused': {
                color: isLight ? '#253865' : '#4a78ff',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { borderRadius: 6, fontWeight: 600 },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: 'none',
            borderRadius: 0,
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
          },
        },
      },
    },
  });
};
