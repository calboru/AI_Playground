'use client';
import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useInfiniteRAGDatabases } from './infinite-rag-databases-context';
import { ChatWithDatabaseAction } from '../actions/chat-with-database-action';
import { jsonToMarkdown } from '../actions/convert-json-to-markdown';

interface IChatWithDatabaseContext {
  chatResponse: string;
  ask: (userPrompt: string, searchTerm?: string) => void;
  isThinking: boolean;
  ragSources: string[];
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
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [ragSources, setRagSources] = useState<string[]>([]);

  const handleAsk = async (userPrompt: string, searchTerm?: string) => {
    try {
      setIsThinking(true);
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

        if (decodedValue?.context) {
          (decodedValue?.context ?? []).forEach((source: string) => {
            setRagSources((prev) => [...prev, jsonToMarkdown(source)]);
          });
        }

        if (decodedValue?.answer) {
          setChatResponse((prev) => prev + decodedValue.answer);
        }
      }
      setIsThinking(false);
    } catch (error) {
      setIsThinking(false);
      console.log(error);
    }
  };

  return (
    <ChatWithDatabaseContext.Provider
      value={{ ragSources, isThinking, chatResponse, ask: handleAsk }}
    >
      {children}
    </ChatWithDatabaseContext.Provider>
  );
};
