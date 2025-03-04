import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import MainLayoutHeader from './components/main-layout-header';
import { IngestionProvider } from '@/(features)/generative-ai/context/ingestion-context';
import { Toaster } from '@/components/ui/toaster';
import { InfiniteIngestionsProvider } from '@/(features)/generative-ai/context/infinite-ingestions-context';
import { InfiniteIngestionContentProvider } from '@/(features)/generative-ai/context/infinite-ingestion-content-context';
import { AppProvider } from './app-context';
import { QueryStringSearchProvider } from '@/(features)/generative-ai/context/querystring-search-context';
import { AvailableColumnsProvider } from '@/(features)/generative-ai/context/list-available-columns-context';
import { LLMProvider } from '@/context/llm-context';
import { CurateAndEmbedProvider } from '@/(features)/generative-ai/context/curation-and-embedding-context';
import { InfiniteRAGDatabasesProvider } from '@/(features)/generative-ai/context/infinite-rag-databases-context';
import { ChatWithDatabaseProvider } from '@/(features)/generative-ai/context/chat-with-database-context';
import { GenerativeAIProvider } from '@/(features)/generative-ai/context/generative-ai-context';
import { RAGDatabaseProvider } from '@/(features)/generative-ai/context/rag-database-context';
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased grow h-lvh bg-indigo-100    overflow-hidden`}
      >
        <MainLayoutHeader />
        <AppProvider>
          <GenerativeAIProvider>
            <LLMProvider>
              <InfiniteIngestionContentProvider>
                <InfiniteIngestionsProvider>
                  <IngestionProvider>
                    <QueryStringSearchProvider>
                      <AvailableColumnsProvider>
                        <CurateAndEmbedProvider>
                          <InfiniteRAGDatabasesProvider>
                            <ChatWithDatabaseProvider>
                              <RAGDatabaseProvider>
                                {children}
                              </RAGDatabaseProvider>
                            </ChatWithDatabaseProvider>
                          </InfiniteRAGDatabasesProvider>
                        </CurateAndEmbedProvider>
                      </AvailableColumnsProvider>
                    </QueryStringSearchProvider>
                  </IngestionProvider>
                </InfiniteIngestionsProvider>
              </InfiniteIngestionContentProvider>
            </LLMProvider>
          </GenerativeAIProvider>
        </AppProvider>
        <Toaster />
      </body>
    </html>
  );
}
