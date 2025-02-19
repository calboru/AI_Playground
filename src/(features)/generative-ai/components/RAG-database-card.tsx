import React from 'react';
import { Button } from '@/components/ui/button';
import { BotMessageSquare } from 'lucide-react';
import { RAGDatabaseType } from '../types/rag-database-type';
import { useInfiniteRAGDatabases } from '../context/infinite-rag-databases-context';

const RAGDatabaseCard = ({ data }: { data: RAGDatabaseType }) => {
  const { selectRAGDatabase, resetCursor } = useInfiniteRAGDatabases();

  return (
    <div className='rounded-lg shadow-md border p-2 flex  flex-col space-y-1  bg-secondary  hover:shadow-md transition duration-200'>
      <div className='w-full flex flex-row items-center  '>
        {/* justify-end is not working */}
        <div className='flex flex-col space-y-1 w-full'>
          <span className='text-xs font-extralight text-gray-800'>
            Last updated: {new Date(data.created_at).toLocaleString()}
          </span>
        </div>
        <div>{/* Add a menu here */}</div>
      </div>

      <div className='w-full flex flex-col space-y-1 p-3 text-sm rounded-md border bg-white '>
        <p className=' text-sm text-blue-600  p-1'>
          {/* Added line clamping */}
          {data.ingestion_description}
        </p>
      </div>
      <div className='  w-full  flex   justify-between       '>
        <Button
          type='button'
          onClick={() => {
            resetCursor();
            selectRAGDatabase(data);
          }}
          size='sm'
          variant='outline'
          className='w-full flex items-center justify-center'
        >
          <BotMessageSquare />
          Chat
        </Button>
      </div>
    </div>
  );
};

export default RAGDatabaseCard;
