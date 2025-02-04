'use client';
import React, { useEffect } from 'react';
import IngestionUploadDialog from './ingestion-upload-dialog';
import { useInfiniteIngestions } from '@/(features)/generative-ai/context/infinite-ingestions';
import IngestionCard from '@/(features)/generative-ai/components/ingestion-card';

const IngestionSources = () => {
  const { fetchMoreIngestions, ingestions } = useInfiniteIngestions();

  useEffect(() => {
    const fetch = async () => {
      await fetchMoreIngestions();
    };
    fetch();
  }, []);

  console.log('from comp', ingestions);

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

      <div className='w-full flex flex-col p-3 overflow-y-auto space-y-3'>
        {ingestions.map((ingestion) => (
          <IngestionCard data={ingestion} key={ingestion.id} />
        ))}
      </div>
    </section>
  );
};

export default IngestionSources;
