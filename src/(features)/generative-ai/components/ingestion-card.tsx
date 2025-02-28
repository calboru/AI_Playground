import React from 'react';
import { IngestionType } from '../types/ingestion-type';
import { IngestionCardMenu } from './ingestion-card-menu';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';
import { useQueryStringSearch } from '../context/querystring-search-context';

const IngestionCard = ({ data }: { data: IngestionType }) => {
  const { resetCursor, selectIngestion } = useInfiniteIngestionContent();
  const { resetSearch } = useQueryStringSearch();

  const handleClick = () => {
    resetCursor();
    selectIngestion(data);
    resetSearch();
  };

  return (
    <div
      onClick={handleClick}
      className='rounded-lg cursor-pointer shadow-lg border hover:border-orange-600 hover:border-2  border-slate-400   flex  flex-col    bg-white-200   hover:shadow-2xl transition duration-400'
    >
      <div className='w-full  border-b '>
        <div className='w-full p-2 justify-between items-center flex'>
          <span className='text-xs   text-gray-800'>
            Ingestion Date: {new Date(data.created_at).toLocaleString()}
          </span>
          <div>
            <IngestionCardMenu />
          </div>
        </div>
      </div>

      <p className='text-lg text-orange-600 font-bold p-2   '>
        {/* Added line clamping */}
        {data.ingestion_description}
      </p>

      <div className='flex justify-start border-t  w-full'>
        <span className='text-xs   p-2 text-gray-800'>
          Total Documents: {data.total_documents.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default IngestionCard;
