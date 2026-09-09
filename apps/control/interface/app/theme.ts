'use client';

import { createTheme } from '@mui/material/styles';

/**
 * Single shared MUI theme for the Control interface, provided via
 * `ThemeProvider` in the root layout. No ad hoc theme overrides in
 * individual components.
 */
export const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  colorSchemes: {
    light: true,
    dark: true,
  },
});
