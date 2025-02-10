'use client';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useInfiniteIngestionContent } from './infinite-ingestion-content-context';
import { QueryStringSearchAction } from '../actions/query-string-search-action';
import { useToast } from '@/hooks/use-toast';

interface IQueryStringSearchContext {
  searchTerm: string;
  search: (searchTerm: string, newSearch: boolean) => void;
  fetchMore: () => void;
  content: unknown[];
  cursor: number;
  searchIsPerformed: boolean;
  resetSearch: () => void;
  isSearching: boolean;
  totalDocuments: number;
  took: number;
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
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const [took, setTook] = useState<number>(0);

  const { toast } = useToast();

  const handleSearch = (searchTerm: string, newSearch: boolean = false) => {
    if (newSearch) {
      setContent([]);
      setCursor(0);
    }
    setSearchTerm(searchTerm);
  };

  const handleFetchMore = useCallback(
    async () => {
      setIsSearching(true);

      try {
        const response = await QueryStringSearchAction(
          selectedIngestion?.index_name ?? '',
          searchTerm,
          cursor
        );

        if (response.meta.totalDocuments === 0) {
          toast({
            title: ':(',
            description: 'Search did not yield any results',
          });
          setContent([]);
          setCursor(0);
          setTotalDocuments(0);
        }

        if (response.meta.totalDocuments === content.length) {
          setIsSearching(false);
          return;
        }

        setContent((prev) => [...prev, ...response.payload]);
        setCursor(response.meta.cursor);
        setTotalDocuments(response.meta.totalDocuments);
        setTook(response.meta.took);

        if (!response.success) {
          toast({
            variant: 'destructive',
            title: 'Unable to perform search',
            description: response.error,
          });
        }
        setIsSearching(false);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Unable to perform search',
          description: JSON.stringify(error),
        });
        setIsSearching(false);
      }
    },
    [searchTerm, selectedIngestion?.index_name, cursor, toast] // Dependencies
  );

  return (
    <QueryStringSearchContext.Provider
      value={{
        totalDocuments,
        took,
        fetchMore: handleFetchMore,
        isSearching,
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
