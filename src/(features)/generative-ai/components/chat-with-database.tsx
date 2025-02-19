'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Spinner from '@/app/components/spinner';
import { useInfiniteRAGDatabases } from '../context/infinite-rag-databases-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useChatWithDatabase } from '../context/chat-with-database-context';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BotMessageSquare } from 'lucide-react';
import ViewRAGSourcesDialog from './view-rag-sources-dialog';
// Zod Schema
const chatSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  searchTerm: z.string().optional(),
});

const ChatWithDatabase = () => {
  const { ask, chatResponse, isThinking, ragSources } = useChatWithDatabase();

  const { selectedRAGDatabase, isLoading } = useInfiniteRAGDatabases();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<{ prompt: string; searchTerm?: string }>({
    resolver: zodResolver(chatSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: { prompt: string; searchTerm?: string }) => {
    await ask(data.prompt, data?.searchTerm);
  };

  const combinedLoading = isLoading || isThinking;
  return (
    <section className='rounded-md bg-white w-full border shadow-sm'>
      <header className='border-b px-2 py-1 flex items-center space-x-2'>
        <h2 className='text-lg font-semibold flex items-center space-x-2'>
          <span>Chat with:</span>
          <Spinner isLoading={isLoading} />
        </h2>
        <p className='text-sm text-gray-600'>
          {selectedRAGDatabase?.ingestion_description}
        </p>
      </header>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex flex-col p-2 border w-full space-y-1 bg-slate-100'
      >
        <div className='flex w-full bg-white shadow rounded-md border space-y-2 flex-col p-3'>
          <div className='flex flex-col space-y-2'>
            <label className='text-sm font-bold text-gray-700'>Prompt</label>
            <Input
              placeholder='What compounds are available for Multiple Sclerosis?'
              {...register('prompt')}
            />
            {errors.prompt && (
              <span className='text-red-500 text-xs'>
                {errors.prompt && typeof errors.prompt.message === 'string' && (
                  <span className='text-red-500 text-xs'>
                    {errors.prompt.message}
                  </span>
                )}
              </span>
            )}
          </div>

          <div className='flex flex-col space-y-2'>
            <label className='text-sm font-bold text-gray-700'>
              Optional Refinement
            </label>
            <Input
              placeholder='((quick AND fox) OR (brown AND fox) OR fox)'
              {...register('searchTerm')}
            />
          </div>
          <div className='flex w-full flex-row space-x-1  justify-end'>
            <ViewRAGSourcesDialog
              disabled={
                !selectedRAGDatabase ||
                !isValid ||
                combinedLoading ||
                ragSources.length === 0
              }
              isLoading={combinedLoading}
            />

            <Button
              type='submit'
              disabled={!selectedRAGDatabase || !isValid || combinedLoading}
              size='lg'
            >
              <Spinner isLoading={isThinking} />
              {!combinedLoading && <BotMessageSquare />}
              Ask
            </Button>
          </div>
        </div>
      </form>
      <div>
        <h3 className='text-lg font-semibold px-2 py-1 border-b'>Response</h3>
        <div className='p-2 rounded-md'>
          <Markdown remarkPlugins={[remarkGfm]} className='text-lg'>
            {chatResponse}
          </Markdown>
        </div>
      </div>
    </section>
  );
};

export default ChatWithDatabase;
