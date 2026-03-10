import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SocketProvider } from '@/components/providers/SocketProvider';
import { SseProvider } from '@/components/providers/SseProvider';
import { LoadingProvider } from '@/components/providers/LoadingProvider';
import { SecurityProvider } from '@/components/providers/SecurityProvider';
import { GlobalLoader } from '@/components/atoms/GlobalLoader';
import { CONFIG } from '@/lib/constants/config';
import { Toaster } from 'sonner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16a34a',
};

export const metadata: Metadata = {
  title: {
    default: CONFIG.appName,
    template: `%s | ${CONFIG.appName}`,
  },
  description: 'Virtual fantasy cricket prediction platform',
  manifest: '/manifest.json',
  robots: { index: false },  // Private app — no indexing
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-background text-text-primary antialiased`} suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>
            <SecurityProvider>
              <LoadingProvider>
                <SocketProvider>
                  <SseProvider>
                    <GlobalLoader />
                    {children}
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        style: {
                          background: 'hsl(var(--color-card))',
                          color: 'hsl(var(--color-text-primary))',
                          border: '1px solid hsl(var(--color-border))',
                        },
                      }}
                    />
                  </SseProvider>
                </SocketProvider>
              </LoadingProvider>
            </SecurityProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
