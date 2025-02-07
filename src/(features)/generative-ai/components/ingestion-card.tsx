import React from 'react';
import { IngestionType } from '../types/intestion-type';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { IngestionCardMenu } from './ingestion-card-menu';

const IngestionCard = ({ data }: { data: IngestionType }) => {
  return (
    <div className='rounded-lg shadow-md border p-2 flex  flex-col space-y-1  bg-secondary  hover:shadow-md transition duration-200'>
      <div className='w-full flex   justify-between  '>
        {/* justify-end is not working */}
        <div></div>
        <div>
          <IngestionCardMenu />
        </div>
      </div>
      <div className='w-full flex flex-col space-y-1 p-3 text-sm rounded-md border bg-white '>
        <div className='flex justify-between items-center p-1 '>
          <span className='text-sm   text-gray-700 font-semibold'>
            Created At:
          </span>
          <span className='text-sm text-gray-500'>
            {new Date(data.created_at).toLocaleString()}
          </span>
        </div>

        <div className='flex justify-between items-center   p-1 '>
          <span className='text-sm   text-gray-700 font-semibold'>
            Total Documents:
          </span>
          <span className='text-sm text-gray-500'>{data.total_documents}</span>
        </div>
        <p className=' text-sm text-blue-600  p-1'>
          {/* Added line clamping */}
          {data.ingestion_description}
        </p>
      </div>
      <div className='  w-full  flex   justify-between       '>
        <Button
          size='sm'
          variant='outline'
          className='w-full flex items-center justify-center'
        >
          {/* Centered icons */}
          <Search /> View Documents
          {/* Added margin right to icon */}
        </Button>
      </div>
    </div>
  );
};

export default IngestionCard;
