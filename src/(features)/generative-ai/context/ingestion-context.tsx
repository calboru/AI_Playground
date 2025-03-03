'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
} from 'react';
import { BulkIndexCSVAction } from '../actions/bulk-index-csv-action';
import { useToast } from '@/hooks/use-toast';
import { useInfiniteIngestionContent } from './infinite-ingestion-content-context';
import { useInfiniteIngestions } from './infinite-ingestions-context';
import { DeleteIndexAction } from '../actions/delete-index-action';

interface IIngestionContext {
  ingestionDialogOpen: boolean;
  openIngestionDialog: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  bulkIndexCSV: (
    ingestionDescription: string,
    ingestionFiles: File[],
    existingIndexName: string
  ) => Promise<void>;
  deleteIngestion: (indexName: string) => Promise<void>;
}

const IngestionContext = createContext<IIngestionContext | undefined>(
  undefined
);

export const IngestionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ingestionDialogOpen, setIngestionDialogOpen] = useState(false);

  const { selectIngestion } = useInfiniteIngestionContent();
  const { resetCursor } = useInfiniteIngestionContent();

  const { resetCursor: resetCursorForInfiniteIngestions } =
    useInfiniteIngestions();

  const { toast } = useToast();

  const handleDeleteIngestion = async (indexName: string) => {
    try {
      await DeleteIndexAction(indexName);
      resetCursorForInfiniteIngestions();
    } catch (error) {
      console.log(error);
      toast({
        variant: 'destructive',
        title: 'Unable to delete index',
        description: JSON.stringify(error),
      });
    }
  };

  const handleBulkIndexCSV = async (
    ingestionDescription: string,
    ingestionFiles: File[],
    existingIndexName: string
  ) => {
    try {
      setIsLoading(true);
      const response = await BulkIndexCSVAction(
        ingestionDescription,
        ingestionFiles,
        existingIndexName
      );
      setIsLoading(false);
      setIngestionDialogOpen(false);
      selectIngestion(response.payload);
      resetCursor();
      resetCursorForInfiniteIngestions();

      toast({
        title: 'Ingestion',
        description: 'Ingestion completed successfully.',
      });
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      toast({
        variant: 'destructive',
        title: 'Unable to ingest files',
        description: JSON.stringify(error),
      });
    }
  };

  return (
    <IngestionContext.Provider
      value={{
        deleteIngestion: handleDeleteIngestion,
        isLoading,
        bulkIndexCSV: handleBulkIndexCSV,
        ingestionDialogOpen,
        openIngestionDialog: setIngestionDialogOpen,
      }}
    >
      {children}
    </IngestionContext.Provider>
  );
};

export const useIngestion = (): IIngestionContext => {
  const context = useContext(IngestionContext);
  if (!context) {
    throw new Error('useIngestion must be used within an IngestionProvider');
  }
  return context;
};
