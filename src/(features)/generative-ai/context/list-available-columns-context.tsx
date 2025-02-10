'use client';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { ListAvailableColumnsAction } from '../actions/list-available-columns-action';
import { useInfiniteIngestionContent } from './infinite-ingestion-content-context';
import { AvailableColumnType } from '../types/available-columns-type';

// Define the shape of the context
interface AvailableColumnsContextType {
  availableColumns: AvailableColumnType[];
  isLoading: boolean;
  fetchAvailableColumns: () => Promise<void>;
}

// Create the context
const AvailableColumnsContext = createContext<
  AvailableColumnsContextType | undefined
>(undefined);

// Create a provider component
export const AvailableColumnsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [availableColumns, setAvailableColumns] = useState<
    AvailableColumnType[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { selectedIngestion } = useInfiniteIngestionContent();

  const fetchAvailableColumns = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await ListAvailableColumnsAction(
        selectedIngestion?.index_name ?? ''
      );
      setAvailableColumns(response.payload);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedIngestion?.index_name]);

  return (
    <AvailableColumnsContext.Provider
      value={{ availableColumns, isLoading, fetchAvailableColumns }}
    >
      {children}
    </AvailableColumnsContext.Provider>
  );
};

// Custom hook to use the AvailableColumns context
export const useAvailableColumns = (): AvailableColumnsContextType => {
  const context = useContext(AvailableColumnsContext);
  if (context === undefined) {
    throw new Error(
      'useAvailableColumns must be used within an AvailableColumnsProvider'
    );
  }
  return context;
};
