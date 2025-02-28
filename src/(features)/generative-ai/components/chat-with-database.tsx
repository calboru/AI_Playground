'use client';
import React from 'react';
import Spinner from '@/app/components/spinner';
import { useInfiniteRAGDatabases } from '../context/infinite-rag-databases-context';
import { useChatWithDatabase } from '../context/chat-with-database-context';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PromptBox from './prompt-box';

const ChatWithDatabase = () => {
  const { chatResponse } = useChatWithDatabase();
  const { selectedRAGDatabase, isLoading } = useInfiniteRAGDatabases();

  return (
    <section className='flex flex-col space-y-2 m-1 bg-white w-full border rounded-xl  shadow-xl border-slate-300'>
      <header className=' flex items-center space-x-1 border-b w-full p-1'>
        <span className='font-bold text-xl text-orange-600 p-2'>
          Chat with:
        </span>
        <Spinner isLoading={isLoading} />
        <p className='text-orange-600 text-lg'>
          {selectedRAGDatabase?.ingestion_description}
        </p>
      </header>
      <div className='h-lvh w-full  overflow-x-hidden overflow-y-auto  md:p-6'>
        <Markdown remarkPlugins={[remarkGfm]} className='text-lg '>
          {chatResponse}
        </Markdown>
      </div>

      <footer className='p-4'>
        <PromptBox />
      </footer>
    </section>
  );
};

export default ChatWithDatabase;
