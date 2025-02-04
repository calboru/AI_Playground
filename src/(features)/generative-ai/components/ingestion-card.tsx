import React from 'react';
import { IngestionType } from '../types/intestion-type';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

const IngestionCard = ({ data }: { data: IngestionType }) => {
  return (
    <div className='rounded-lg shadow-md border p-2 flex flex-col space-y-2  bg-secondary  hover:shadow-lg transition duration-200'>
      {/* Header */}
      <div className='flex justify-between items-center p-1 '>
        <span className='text-sm   text-gray-700 font-semibold'>
          Created At:
        </span>
        <span className='text-sm text-gray-500'>
          {new Date(data.created_at).toLocaleString()}
        </span>
      </div>

      <div className='flex justify-between items-center   border-b-2  p-1 '>
        <span className='text-sm   text-gray-700 font-semibold'>
          Total Documents:
        </span>
        <span className='text-sm text-gray-500'>{data.total_documents}</span>
      </div>
      <div className='w-full p-3 text-sm rounded-md bg-white'>
        <p className='text-gray-600 text-sm line-clamp-2'>
          {/* Added line clamping */}
          {data.ingestion_description}
        </p>
      </div>

      {/* Replaced <h1 className="border" /> with <hr /> */}
      <div className='  w-full  flex space-x-2  justify-between   p-1   '>
        {/* Added space between buttons */}
        <Button
          size='sm'
          variant='outline'
          className='flex-1 flex items-center justify-center'
        >
          {/* Centered icons */}
          <Plus /> Add
          {/* Added margin right to icon */}
        </Button>
        <Button
          size='sm'
          variant='outline'
          className='flex-1 flex items-center justify-center'
        >
          {/* Centered icons */}
          <Search /> View
          {/* Added margin right to icon */}
        </Button>
      </div>
    </div>
  );
};

export default IngestionCard;
