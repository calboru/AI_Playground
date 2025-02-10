import React, { useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAvailableColumns } from '../context/list-available-columns-context';
import Spinner from '@/app/components/spinner';
import { List } from 'lucide-react';

const AvailableColumnsSheet = () => {
  const { availableColumns, isLoading, fetchAvailableColumns } =
    useAvailableColumns();

  useEffect(() => {
    (async () => {
      await fetchAvailableColumns();
    })();
  }, [fetchAvailableColumns]);

  return (
    <Sheet>
      <SheetTrigger>
        <span className='text-blue-600 text-sm font-extralight flex flex-row cursor-pointer  space-x-1 border-b-2   items-center'>
          <List className='h-4 w-4' />
          <span>View columns</span>
        </span>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Available Columns <Spinner isLoading={isLoading} />
          </SheetTitle>
          <SheetDescription>
            List of available columns in the dataset
          </SheetDescription>
        </SheetHeader>
        <div className='w-full'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {availableColumns.map((col, idx) => (
                <TableRow key={idx}>
                  <TableCell>{col.column_name}</TableCell>
                  <TableCell>{col.column_type}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AvailableColumnsSheet;
