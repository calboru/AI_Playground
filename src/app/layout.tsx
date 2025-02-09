import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import MainLayoutHeader from './components/main-layout-header';
import { IngestionProvider } from '@/(features)/generative-ai/context/ingestion-context';
import { Toaster } from '@/components/ui/toaster';
import { InfiniteIngestionsProvider } from '@/(features)/generative-ai/context/infinite-ingestions-context';
import { InfiniteIngestionContentProvider } from '@/(features)/generative-ai/context/infinite-ingestion-content-context';
import { AppProvider } from './app-context';
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Generative AI',
  description: 'with Elastic search',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased grow h-lvh  bg-slate-100 overflow-hidden`}
      >
        <MainLayoutHeader />
        <AppProvider>
          <InfiniteIngestionContentProvider>
            <InfiniteIngestionsProvider>
              <IngestionProvider>{children}</IngestionProvider>
            </InfiniteIngestionsProvider>
          </InfiniteIngestionContentProvider>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
