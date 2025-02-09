import React, { useEffect, useRef } from 'react';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';
import IngestionContentCard from './intestion-content-card';
import { useInView } from 'framer-motion';

const InfiniteIngestionContent = () => {
  const { content, fetchMore, selectedIngestion } =
    useInfiniteIngestionContent();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    (async () => {
      if (!isInView) return;
      await fetchMore();
    })();
  }, [isInView, selectedIngestion, fetchMore]);

  return (
    <div className='flex w-full space-y-2   flex-col p-2'>
      {content.map((data, idx) => (
        <IngestionContentCard
          data={data}
          key={(data as { id?: string | number })?.id ?? idx}
          index={idx}
        />
      ))}
      <div className='w-full p-2' ref={ref}></div>
    </div>
  );
};

export default InfiniteIngestionContent;
