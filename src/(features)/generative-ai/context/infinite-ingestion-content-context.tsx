'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';

import { InfiniteIngestionContentAction } from '../actions/infinite-ingestion-content-action';
import { IngestionType } from '../types/ingestion-type';

interface IInfiniteIngestionContentContext {
  content: unknown[];
  isLoading: boolean;
  fetchMore: (resetCursor?: boolean) => Promise<void>;
  resetCursor: () => void;
  cursor: number;
  selectIngestion: (data: IngestionType) => void;
  selectedIngestion: IngestionType | undefined;
  newIngestion: () => void;
  totalDocumentsInIndex: number;
  resetDate: Date;
}

const InfiniteIngestionContentContext = createContext<
  IInfiniteIngestionContentContext | undefined
>(undefined);

const InfiniteIngestionContentProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<unknown[]>([]);
  const [cursor, setCursor] = useState(0);
  const [selectedIngestion, setSelectedIngestion] = useState<
    IngestionType | undefined
  >();
  const [resetDate, setResetDate] = useState<Date>(new Date());

  const [totalDocumentsInIndex, setTotalDocumentsInIndex] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedData = localStorage.getItem('selectedIngestion');
      if (storedData) {
        setSelectedIngestion(JSON.parse(storedData));
      }
    }
  }, []);

  const handleResetCursor = () => {
    setCursor(0);
    setContent([]);
    setResetDate(new Date());
  };

  const fetchMore = useCallback(
    async (resetCursor: boolean = false) => {
      if (resetCursor) {
        handleResetCursor();
      }

      try {
        setIsLoading(true);

        const payload = await InfiniteIngestionContentAction(
          resetCursor ? 0 : cursor,
          selectedIngestion?.index_name ?? ''
        );

        setTotalDocumentsInIndex(payload.totalDocuments);

        setContent((prev) => [...prev, ...payload.documents]);

        setCursor(payload.cursor);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    },
    [content?.length, cursor, selectedIngestion]
  );

  const handleSelectIngestion = (data: IngestionType) => {
    setSelectedIngestion(data);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('selectedIngestion', JSON.stringify(data));
    }
  };

  return (
    <InfiniteIngestionContentContext.Provider
      value={{
        totalDocumentsInIndex,
        newIngestion: () => setSelectedIngestion(undefined),
        selectedIngestion,
        selectIngestion: handleSelectIngestion,
        cursor,
        resetCursor: handleResetCursor,
        content,
        fetchMore,
        isLoading,
        resetDate,
      }}
    >
      {children}
    </InfiniteIngestionContentContext.Provider>
  );
};

const useInfiniteIngestionContent = (): IInfiniteIngestionContentContext => {
  const context = useContext(InfiniteIngestionContentContext);
  if (context === undefined) {
    throw new Error(
      'useInfiniteIngestionContent must be used within an InfiniteIngestionContentProvider'
    );
  }
  return context;
};

export { InfiniteIngestionContentProvider, useInfiniteIngestionContent };
