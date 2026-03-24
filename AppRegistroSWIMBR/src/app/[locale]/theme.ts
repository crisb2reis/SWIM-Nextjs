/**
 * src/app/theme.ts
 * Tema centralizado baseado no Materio (azul navy + acentos vibrantes).
 */
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main:          '#696CFF',
      light:         '#8082FF',
      dark:          '#5457DB',
      contrastText:  '#FFFFFF',
    },
    secondary: {
      main:          '#03DAC6',
      contrastText:  '#000',
    },
    background: {
      default: '#F5F5F9',
      paper:   '#FFFFFF',
    },
    error:   { main: '#FF3E1D' },
    warning: { main: '#FFAB00' },
    info:    { main: '#03C3EC' },
    success: { main: '#71DD37' },
    text: {
      primary:   '#566A7F',
      secondary: '#8592A3',
    },
    divider: '#DBDADE',
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
        root: { borderRadius: 12, border: '1px solid #DBDADE' },
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
      defaultProps: { size: 'small' },
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

export default theme;
