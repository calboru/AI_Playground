import React from 'react';

const IngestionContentCard = ({
  data,
  index,
}: {
  data: unknown;
  index: number;
}) => {
  return (
    <div className='w-full flex flex-col grow border rounded-md bg-slate-100 p-2 text-sm'>
      {Object.entries(data as { [key: string]: unknown }).map(
        ([key, value]) => (
          <div className='bg-white p-1 rounded w-full break-words' key={key}>
            <div className='flex flex-col'>
              <span className='text-gray-800 font-bold'>{key}:</span>
              <span className='text-gray-800 w-full break-words'>
                {String(value)}
              </span>
            </div>
          </div>
        )
      )}
      {index}
    </div>
  );
};

export default IngestionContentCard;
