'use client';
import React, { createContext, useContext, useState } from 'react';
import { useInfiniteIngestionContent } from './infinite-ingestion-content-context';
import { QueryStringSearchAction } from '../actions/query-string-search-action';
import { useToast } from '@/hooks/use-toast';

interface IQueryStringSearchContext {
  searchTerm: string;
  search: (searchTerm: string) => void;
  content: unknown[];
  cursor: number;
  searchIsPerformed: boolean;
  resetSearch: () => void;
}

const QueryStringSearchContext = createContext<
  IQueryStringSearchContext | undefined
>(undefined);

export const useQueryStringSearch = () => {
  const context = useContext(QueryStringSearchContext);
  if (!context) {
    throw new Error(
      'useQueryStringSearch must be used within a QueryStringSearchProvider'
    );
  }
  return context;
};

interface QueryStringSearchProviderProps {
  children: React.ReactNode;
}

export const QueryStringSearchProvider: React.FC<
  QueryStringSearchProviderProps
> = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { selectedIngestion } = useInfiniteIngestionContent();
  const [cursor, setCursor] = useState<number>(0);
  const [content, setContent] = useState<unknown[]>([]);
  const { toast } = useToast();

  const handleSearch = async (searchTerm: string) => {
    setSearchTerm(searchTerm);

    try {
      const response = await QueryStringSearchAction(
        selectedIngestion?.index_name ?? '',
        searchTerm,
        0
      );
      setContent((prev) => [...prev, ...response.payload]);
      setCursor(response.meta.cursor);

      if (!response.success) {
        toast({
          variant: 'destructive',
          title: 'Unable to perform search',
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Unable to perform search',
        description: JSON.stringify(error),
      });
      console.log(error);
    }
  };

  return (
    <QueryStringSearchContext.Provider
      value={{
        searchTerm,
        search: handleSearch,
        content,
        cursor,
        searchIsPerformed: searchTerm.length > 0,
        resetSearch: () => setSearchTerm(''),
      }}
    >
      {children}
    </QueryStringSearchContext.Provider>
  );
};
