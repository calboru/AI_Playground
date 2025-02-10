import React, { useEffect, useRef } from 'react';

import IngestionContentCard from './intestion-content-card';
import { useInView } from 'framer-motion';
import { useQueryStringSearch } from '../context/querystring-search-context';

const InfiniteSearchResults = () => {
  const { fetchMore, content, searchTerm } = useQueryStringSearch();

  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    (async () => {
      if (!isInView) return;

      fetchMore();
    })();
  }, [isInView, searchTerm, fetchMore]);

  return (
    <div className='flex w-full space-y-2 flex-col p-2'>
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

export default InfiniteSearchResults;
