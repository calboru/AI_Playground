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

interface IIngestionContext {
  ingestionDialogOpen: boolean;
  openIngestionDialog: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  bulkIndexCSV: (
    ingestionDescription: string,
    ingestionFiles: File[]
  ) => Promise<void>;
}

const IngestionContext = createContext<IIngestionContext | undefined>(
  undefined
);

export const IngestionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ingestionDialogOpen, setIngestionDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleBulkIndexCSV = async (
    ingestionDescription: string,
    ingestionFiles: File[]
  ) => {
    try {
      setIsLoading(true);
      await BulkIndexCSVAction(ingestionDescription, ingestionFiles);
      setIsLoading(false);
      setIngestionDialogOpen(false);
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
