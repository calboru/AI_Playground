import { ScrollArea } from '@/components/ui/scroll-area';
import React from 'react';

const IngestionContentCard = ({
  data,
  index,
}: {
  data: unknown;
  index: number;
}) => {
  return (
    <ScrollArea className='flex h-72 w-48 flex-col flex-wrap border rounded-md bg-slate-100  p-2 text-sm max-w-sm'>
      {Object.entries(data as { [key: string]: unknown }).map(
        ([key, value]) => (
          <div className='bg-white p-1 rounded' key={key}>
            <div className='flex flex-col justify-between   '>
              <span className='text-gray-800  font-bold '>{key}:</span>
              <span className='text-gray-800'>{String(value)}</span>
            </div>
          </div>
        )
      )}
      {index}
    </ScrollArea>
  );
};

export default IngestionContentCard;
