import React from 'react';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';
import { useQueryStringSearch } from '../context/querystring-search-context';

const IngestionContentCard = ({
  data,
  index,
}: {
  data: unknown;
  index: number;
}) => {
  const { selectedIngestion } = useInfiniteIngestionContent();
  const { searchIsPerformed, totalDocuments } = useQueryStringSearch();

  const relevanceScore = (data as { relevance_score: number })?.relevance_score;

  return (
    <div className='w-full flex flex-col space-y-1 grow border rounded bg-slate-100 p-2 text-sm shadow-md font-extralight   '>
      <div className='flex flex-row  justify-between  p-1 font-extralight text-sm'>
        {relevanceScore > 0 && (
          <div className='flex flex-row space-x-2  border p-1 rounded-md bg-white shadow-md text-red-500 italic'>
            <span>Score:</span>
            <span>{relevanceScore}</span>
          </div>
        )}

        <div></div>
        <div className='flex flex-row space-x-2  border p-1 rounded-md bg-white shadow-md  italic'>
          <span className='font-semibold'>Document:</span>
          <span> {(index + 1).toLocaleString()}</span>
          <span>of</span>
          <span>
            {!searchIsPerformed
              ? selectedIngestion?.total_documents.toLocaleString()
              : totalDocuments.toLocaleString()}
          </span>
        </div>
      </div>
      <div className='bg-white rounded-sm p-1 shadow  border-2'>
        {Object.entries(data as { [key: string]: unknown }).map(
          ([key, value]) => (
            <div className='p-1   w-full break-words ' key={key}>
              <div className='flex flex-col'>
                <span className='text-blue-500 font-bold'>{key}:</span>
                <span className='text-gray-800 w-full break-words'>
                  {String(value)}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default IngestionContentCard;
