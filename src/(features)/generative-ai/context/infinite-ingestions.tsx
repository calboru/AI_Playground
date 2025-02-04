'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IngestionType } from '../types/intestion-type';
import { InfiniteIngestionsAction } from '../actions/infinite-ingestions-action';

interface IInfiniteIngestionsContext {
  ingestions: IngestionType[];
  isLoading: boolean;
  fetchMoreIngestions: () => void;
}

const InfiniteIngestionsContext = createContext<
  IInfiniteIngestionsContext | undefined
>(undefined);

const InfiniteIngestionsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ingestions, setIngestions] = useState<IngestionType[]>([]);

  const fetchMoreIngestions = async () => {
    try {
      setIsLoading(true);
      const lastItem = (ingestions ?? [])[ingestions.length - 1];

      const cursor = {
        id: lastItem?.id ?? '',
        created_at: new Date(lastItem?.created_at ?? new Date()),
      };

      const payload = await InfiniteIngestionsAction(cursor);

      setIngestions((prev) => [...prev, ...payload.documents]);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <InfiniteIngestionsContext.Provider
      value={{ ingestions, fetchMoreIngestions, isLoading }}
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
