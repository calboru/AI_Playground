'use client';
import React, { createContext, useContext, ReactNode } from 'react';
import { DeleteRAGDatabaseAction } from '../actions/delete-RAG-database-action';
import { useInfiniteRAGDatabases } from './infinite-rag-databases-context';
import { useChatWithDatabase } from './chat-with-database-context';

interface RAGDatabaseContextProps {
  deleteRAGDatabase: (ragIndexName: string) => void;
}

const RAGDatabaseContext = createContext<RAGDatabaseContextProps | undefined>(
  undefined
);

export const RAGDatabaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { resetCursor } = useInfiniteRAGDatabases();
  const { clearChatHistory } = useChatWithDatabase();

  const handleDeleteRAGDatabase = async (ragIndexName: string) => {
    try {
      await DeleteRAGDatabaseAction(ragIndexName);
      resetCursor();
      clearChatHistory();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <RAGDatabaseContext.Provider
      value={{ deleteRAGDatabase: handleDeleteRAGDatabase }}
    >
      {children}
    </RAGDatabaseContext.Provider>
  );
};

export const useRAGDatabase = (): RAGDatabaseContextProps => {
  const context = useContext(RAGDatabaseContext);
  if (!context) {
    throw new Error('useRAGDatabase must be used within a RAGDatabaseProvider');
  }
  return context;
};
