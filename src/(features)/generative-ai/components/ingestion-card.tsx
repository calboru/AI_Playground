import React from 'react';
import { IngestionType } from '../types/intestion-type';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { IngestionCardMenu } from './ingestion-card-menu';

import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';

const IngestionCard = ({ data }: { data: IngestionType }) => {
  const { resetCursor, selectIngestion } = useInfiniteIngestionContent();
  return (
    <div className='rounded-lg shadow-md border p-2 flex  flex-col space-y-1  bg-secondary  hover:shadow-md transition duration-200'>
      <div className='w-full flex flex-row items-center  '>
        {/* justify-end is not working */}
        <div className='flex flex-col space-y-1 w-full'>
          <span className='text-xs font-extralight text-gray-800'>
            Ingested on: {new Date(data.created_at).toLocaleString()}
          </span>
        </div>
        <div>
          <IngestionCardMenu />
        </div>
      </div>

      <div className='w-full flex flex-col space-y-1 p-3 text-sm rounded-md border bg-white '>
        <p className=' text-sm text-blue-600  p-1'>
          {/* Added line clamping */}
          {data.ingestion_description}
        </p>
      </div>
      <div className='  w-full  flex   justify-between       '>
        <Button
          onClick={() => {
            resetCursor();
            selectIngestion(data);
          }}
          size='sm'
          variant='outline'
          className='w-full flex items-center justify-center'
        >
          {/* Centered icons */}
          <Search /> View {data.total_documents} Documents
          {/* Added margin right to icon */}
        </Button>
      </div>
    </div>
  );
};

export default IngestionCard;
