import React from 'react';
import { RAGDatabaseType } from '../types/rag-database-type';
import { useInfiniteRAGDatabases } from '../context/infinite-rag-databases-context';
import { CuratedDatasetMenu } from './curated-dataset-menu';

const RAGDatabaseCard = ({ data }: { data: RAGDatabaseType }) => {
  const { selectRAGDatabase, resetCursor } = useInfiniteRAGDatabases();

  const handleClick = () => {
    resetCursor();
    selectRAGDatabase(data);
  };

  return (
    <div className='rounded-lg cursor-pointer shadow-lg border hover:border-orange-600 hover:border-2  border-slate-400   flex  flex-col    bg-white-200   hover:shadow-2xl transition duration-400'>
      <div className='w-full  border-b '>
        <div className='w-full p-2 justify-between items-center flex'>
          <span className='text-xs   text-gray-800'>
            Last updated: {new Date(data.created_at).toLocaleString()}
          </span>
          <div>
            <CuratedDatasetMenu RAGDatabase={data} />
          </div>
        </div>
      </div>

      <p
        onClick={handleClick}
        className='text-lg text-orange-600 font-bold p-2   '
      >
        {/* Added line clamping */}
        {data.ingestion_description}
      </p>

      <div className='flex justify-start border-t  w-full'>
        <span className='text-xs   p-2 text-gray-800'></span>
      </div>
    </div>
  );
};

export default RAGDatabaseCard;
