'use client';
import React, { useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';
import Spinner from '@/app/components/spinner';
import { useInfiniteRAGDatabases } from '../context/infinite-rag-databases-context';
import RAGDatabaseCard from './RAG-database-card';

const InfiniteRAGDatabases = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const { RAGDatabases, isLoading, fetchMore } = useInfiniteRAGDatabases();

  useEffect(() => {
    (async () => {
      if (!isInView) return;
      await fetchMore();
    })();
  }, [isInView]);

  return (
    <section className='rounded-md max-w-xs flex flex-col space-y-2  bg-white w-full border'>
      <div className='border-b-2 flex items-center w-full justify-center'>
        <div className='p-1 flex flex-row w-full items-center justify-center'>
          <span className='flex font-bold text-xl font-mono'>
            Select database
          </span>
          <div>
            <Spinner isLoading={isLoading} />
          </div>
        </div>
      </div>

      <div className='w-full flex flex-col p-3 overflow-y-auto space-y-3'>
        {RAGDatabases.map((db) => (
          <RAGDatabaseCard data={db} key={db.rag_index_name} />
        ))}
        <div className=' ' ref={ref}>
          {!isInView && <span>Loading</span>}
        </div>
      </div>
    </section>
  );
};

export default InfiniteRAGDatabases;
