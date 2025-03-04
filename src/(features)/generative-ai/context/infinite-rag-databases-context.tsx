'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';

import { RAGDatabaseType } from '../types/rag-database-type';
import { InfiniteRAGDatabasesAction } from '../actions/infinite-rag-databases-action';

interface IInfiniteRAGDatabasesContext {
  RAGDatabases: RAGDatabaseType[];
  isLoading: boolean;
  fetchMore: () => Promise<void>;
  selectRAGDatabase: Dispatch<SetStateAction<RAGDatabaseType | undefined>>;
  resetCursor: () => void;
  selectedRAGDatabase: RAGDatabaseType | undefined;
  resetDate: Date;
}

const InfiniteRAGDatabasesContext = createContext<
  IInfiniteRAGDatabasesContext | undefined
>(undefined);

const InfiniteRAGDatabasesProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [RAGDatabases, setRAGDatabases] = useState<RAGDatabaseType[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selectedRAGDatabase, setSelectedRAGDatabase] = useState<
    RAGDatabaseType | undefined
  >();
  const [resetDate, setResetDate] = useState(new Date());

  const fetchMore = async () => {
    try {
      setIsLoading(true);

      const payload = await InfiniteRAGDatabasesAction(cursor);
      setRAGDatabases((prev) => [...prev, ...payload.documents]);

      setCursor(payload.cursor);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  const handleResetCursor = () => {
    setResetDate(new Date());
    setCursor(0);
    setRAGDatabases([]);
  };

  return (
    <InfiniteRAGDatabasesContext.Provider
      value={{
        resetDate,
        selectedRAGDatabase: selectedRAGDatabase,
        resetCursor: handleResetCursor,
        selectRAGDatabase: setSelectedRAGDatabase,
        RAGDatabases,
        fetchMore,
        isLoading,
      }}
    >
      {children}
    </InfiniteRAGDatabasesContext.Provider>
  );
};

const useInfiniteRAGDatabases = (): IInfiniteRAGDatabasesContext => {
  const context = useContext(InfiniteRAGDatabasesContext);
  if (context === undefined) {
    throw new Error(
      'useInfiniteRAGDatabases must be used within an InfiniteRAGDatabasesProvider'
    );
  }
  return context;
};

export { InfiniteRAGDatabasesProvider, useInfiniteRAGDatabases };
