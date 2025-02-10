import React from 'react';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';

const IngestionContentCard = ({
  data,
  index,
}: {
  data: unknown;
  index: number;
}) => {
  const { selectedIngestion } = useInfiniteIngestionContent();

  return (
    <div className='w-full flex flex-col space-y-1 grow border rounded bg-slate-100 p-2 text-sm shadow-md font-extralight   '>
      <div className='flex flex-row justify-between  p-1 font-extralight text-sm'>
        <div></div>
        <div className='flex flex-row space-x-2  border p-1 rounded-md bg-white shadow-md  italic'>
          <span>Document:</span>
          <span> {(index + 1).toLocaleString()}</span>
          <span>of</span>
          <span>{selectedIngestion?.total_documents.toLocaleString()}</span>
        </div>
      </div>
      <div className='bg-white rounded-sm p-1 shadow  border-2'>
        {Object.entries(data as { [key: string]: unknown }).map(
          ([key, value]) => (
            <div className='p-1   w-full break-words ' key={key}>
              <div className='flex flex-col'>
                <span className='text-gray-800 font-bold'>{key}:</span>
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
