'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { theme } from '@/app/theme';

/**
 * Root client-side providers for the Control interface: MUI's Emotion cache
 * (for the App Router), the shared theme, and TanStack Query's client.
 *
 * One `QueryClientProvider` for the whole app, mounted here in the root
 * layout. Query results seeded from Server Components should be hydrated
 * via `HydrationBoundary` inside individual routes, not re-fetched here.
 */
export function AppProviders({ children }: { readonly children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <AppRouterCacheProvider options={{ key: 'css' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <InitColorSchemeScript attribute="class" />
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
