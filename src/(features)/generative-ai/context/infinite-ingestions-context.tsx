'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { IngestionType } from '../types/intestion-type';
import { InfiniteIngestionsAction } from '../actions/infinite-ingestions-action';
import { useIngestion } from './ingestion-context';

interface IInfiniteIngestionsContext {
  ingestions: IngestionType[];
  isLoading: boolean;
  fetchMore: () => Promise<void>;
}

const InfiniteIngestionsContext = createContext<
  IInfiniteIngestionsContext | undefined
>(undefined);

const InfiniteIngestionsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ingestions, setIngestions] = useState<IngestionType[]>([]);
  const [cursor, setCursor] = useState(0);
  const { dataRefreshed } = useIngestion();

  useEffect(() => {
    setCursor(0);
    setIngestions([]);
  }, [dataRefreshed]);

  const fetchMore = async () => {
    try {
      setIsLoading(true);

      const payload = await InfiniteIngestionsAction(cursor);
      setIngestions((prev) => [...prev, ...payload.documents]);
      setCursor(payload.cursor);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <InfiniteIngestionsContext.Provider
      value={{
        ingestions,
        fetchMore,
        isLoading,
      }}
    >
      {children}
    </InfiniteIngestionsContext.Provider>
  );
};

const useInfiniteIngestions = (): IInfiniteIngestionsContext => {
  const context = useContext(InfiniteIngestionsContext);
  if (context === undefined) {
    throw new Error(
      'useInfiniteIngestions must be used within an InfiniteIngestionsProvider'
    );
  }
  return context;
};

export { InfiniteIngestionsProvider, useInfiniteIngestions };
