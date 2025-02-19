'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useInfiniteRAGDatabases } from './infinite-rag-databases-context';
import { ChatWithDatabaseAction } from '../actions/chat-with-database-action';

interface IChatWithDatabaseContext {
  chatResponse: string;
  ask: (userPrompt: string, searchTerm?: string) => void;
  isLoading: boolean;
}

const ChatWithDatabaseContext = createContext<
  IChatWithDatabaseContext | undefined
>(undefined);

export const useChatWithDatabase = () => {
  const context = useContext(ChatWithDatabaseContext);
  if (!context) {
    throw new Error(
      'useChatWithDatabase must be used within a ChatWithDatabaseProvider'
    );
  }
  return context;
};

export const ChatWithDatabaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chatResponse, setChatResponse] = useState<string>('');
  const { selectedRAGDatabase } = useInfiniteRAGDatabases();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAsk = async (userPrompt: string, searchTerm?: string) => {
    try {
      setIsLoading(true);
      setChatResponse('');
      const chatStream = await ChatWithDatabaseAction(
        selectedRAGDatabase?.rag_index_name ?? '',
        userPrompt,
        searchTerm
      );
      if (!chatStream) {
        return;
      }
      const reader = chatStream.getReader();
      const decoder = new TextDecoder('utf8');

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedValue = JSON.parse(decoder.decode(value));

        if (decodedValue?.answer) {
          setChatResponse((prev) => prev + decodedValue.answer);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <ChatWithDatabaseContext.Provider
      value={{ isLoading, chatResponse, ask: handleAsk }}
    >
      {children}
    </ChatWithDatabaseContext.Provider>
  );
};
