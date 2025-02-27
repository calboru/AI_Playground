'use client';
import React, { useEffect, useRef } from 'react';
import IngestionUploadDialog from './ingestion-upload-dialog';
import IngestionCard from '@/(features)/generative-ai/components/ingestion-card';
import Spinner from './spinner';

import { useInfiniteIngestions } from '@/(features)/generative-ai/context/infinite-ingestions-context';
import { useInView } from 'framer-motion';

const IngestionSources = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const { ingestions, isLoading, fetchMore } = useInfiniteIngestions();

  useEffect(() => {
    (async () => {
      if (!isInView) return;
      await fetchMore();
    })();
  }, [isInView]);

  return (
    <section className='rounded-xl max-w-xs flex flex-col space-y-2 m-1 bg-white w-full border border-slate-300'>
      <div className='border-b-2 flex items-center w-full justify-center '>
        <div className='p-2 flex flex-row w-full items-center  justify-start'>
          <div className='flex font-bold text-xl text-blue-600 w-full '>
            Ingestions
          </div>
          <div>
            <Spinner isLoading={isLoading} />
          </div>
        </div>
      </div>
      <div className='w-full items-center justify-center   flex  '>
        <IngestionUploadDialog />
      </div>

      <div className='w-full flex flex-col p-3 overflow-y-auto space-y-3'>
        {ingestions.map((ingestion) => (
          <IngestionCard data={ingestion} key={ingestion.index_name} />
        ))}
        <div className=' ' ref={ref}>
          {!isInView && <span>Loading</span>}
        </div>
      </div>
    </section>
  );
};

export default IngestionSources;
