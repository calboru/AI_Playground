'use client';
import React from 'react';
import Spinner from '@/app/components/spinner';
import { useInfiniteRAGDatabases } from '../context/infinite-rag-databases-context';
import { useChatWithDatabase } from '../context/chat-with-database-context';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PromptBox from './prompt-box';
import { ArrowLeft } from 'lucide-react';

const ChatWithDatabase = () => {
  const { chatResponse, chatHistory } = useChatWithDatabase();
  const { selectedRAGDatabase, isLoading } = useInfiniteRAGDatabases();

  return (
    <section className='flex flex-col space-y-2 m-1 bg-white w-full border rounded-xl  shadow-xl border-slate-300'>
      <header className=' flex items-center space-x-1 border-b w-full p-1'>
        {selectedRAGDatabase && (
          <div className='flex w-full items-center font-semibold'>
            <span className='text-xl text-orange-600 p-2'>
              You are chatting with:
            </span>
            <Spinner isLoading={isLoading} />
            <p className='text-blue-600 text-lg italic'>
              {selectedRAGDatabase?.ingestion_description}
            </p>
          </div>
        )}
        {!selectedRAGDatabase && (
          <div className='flex w-full p-2 flex-row space-x-2 text-md  items-center text-blue-500'>
            <ArrowLeft />
            <span className='font-bold '>
              Select a curated database to chat with
            </span>
          </div>
        )}
      </header>
      <div
        className='h-lvh w-full flex flex-col overflow-x-hidden overflow-y-auto md:p-3'
        ref={(el) => {
          if (el) {
            el.scrollTop = el.scrollHeight;
          }
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]} className='text-lg '>
          {chatHistory
            .map((entry) => `**${entry.prompt}**  \n${entry.response}\n `)
            .join('  \n')}
        </Markdown>
        <Markdown remarkPlugins={[remarkGfm]} className='text-lg '>
          {chatResponse}
        </Markdown>
      </div>
      {/* {chatResponse} */}
      <footer className='p-4'>
        <PromptBox />
      </footer>
    </section>
  );
};

export default ChatWithDatabase;
