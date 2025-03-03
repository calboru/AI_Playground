'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IngestionType } from '../types/ingestion-type';
import { InfiniteIngestionsAction } from '../actions/infinite-ingestions-action';

interface IInfiniteIngestionsContext {
  ingestions: IngestionType[];
  isLoading: boolean;
  fetchMore: (resetCursor?: boolean) => Promise<void>;
  resetDate: Date;
  resetCursor: () => void;
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
  const [resetDate, setResetDate] = useState<Date>(new Date());

  const handleResetCursor = () => {
    setCursor(0);
    setIngestions([]);
    setResetDate(new Date());
  };

  const fetchMore = async (resetCursor?: boolean) => {
    try {
      if (resetCursor) {
        setCursor(0);
        setIngestions([]);
      }

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
        resetDate,
        resetCursor: handleResetCursor,
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
