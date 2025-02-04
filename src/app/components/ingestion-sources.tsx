import React from 'react';
import IngestionUploadDialog from './ingestion-upload-dialog';

const IngestionSources = () => {
  return (
    <section className='rounded-md max-w-xs flex flex-col space-y-2  bg-white w-full border'>
      <div className='border-b-2     items-center w-full'>
        <div className='p-1'>
          <span className='font-bold text-xl font-mono'>Ingestions</span>
        </div>
      </div>
      <div className='w-full items-center justify-center   flex  '>
        <IngestionUploadDialog />
      </div>
    </section>
  );
};

export default IngestionSources;
