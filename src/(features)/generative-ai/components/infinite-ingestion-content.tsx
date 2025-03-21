import React, { useEffect, useRef } from 'react';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';
import IngestionContentCard from './intestion-content-card';
import { useInView } from 'framer-motion';

const InfiniteIngestionContent = () => {
  const {
    content,
    fetchMore,
    selectedIngestion,
    totalDocumentsInIndex,
    resetDate,
  } = useInfiniteIngestionContent();
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    (async () => {
      if (!isInView) return;
      await fetchMore(false);
    })();
  }, [isInView, selectedIngestion, resetDate]);

  return (
    <div className='flex w-full space-y-2 flex-col '>
      {content.map((data, idx) => (
        <IngestionContentCard
          totalDocumentsInIndex={totalDocumentsInIndex}
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
