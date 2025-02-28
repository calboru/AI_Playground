'use client';
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import LLMModelListDropdown from '@/components/llm-dropdown';
import { Input } from '@/components/ui/input';
import ViewRAGSourcesDialog from './view-rag-sources-dialog';
import { useChatWithDatabase } from '../context/chat-with-database-context';

const LLMSearchBar: React.FC = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    ask,
    isThinking,
    setUserPrompt,
    userPrompt,
    searchTerm,
    setSearchTerm,
  } = useChatWithDatabase();

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Grow upwards
    }
  }, [userPrompt]);

  // Handle Enter key press to submit the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      // Allow Shift + Enter for newlines
      e.preventDefault(); // Prevent newline in textarea
      if (userPrompt.length > 2 && !isThinking) {
        // Match the button's condition
        formRef.current?.requestSubmit(); // Trigger form submission
      }
    }
  };

  // Handle form submission
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPrompt.length > 2 && !isThinking) {
      ask();
      setUserPrompt(''); // Clear the prompt after submission
      setSearchTerm(''); // Clear the refinement field
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className='flex items-center justify-center flex-col p-1'
    >
      <div className='flex w-full justify-end max-w-4xl p-1'>
        <ViewRAGSourcesDialog disabled={false} isLoading={false} />
      </div>
      <div className='relative flex flex-col-reverse gap-2 bg-white border border-slate-400 rounded-2xl shadow-lg p-2 w-full max-w-4xl'>
        <div className='flex justify-end items-center gap-2'>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='placeholder-gray-600 text-gray-900'
            placeholder='Optional Refinement: ((quick AND fox) OR (brown AND fox) OR fox)'
          />
          <LLMModelListDropdown />
          <Button
            type='submit'
            className={`w-10 h-10 flex items-center justify-center ${
              userPrompt.length > 2 && !isThinking
                ? 'bg-green-500 text-white hover:bg-green-700'
                : 'bg-gray-200'
            } rounded-full transition-colors`}
            disabled={userPrompt.length <= 2 || isThinking}
          >
            <ArrowUp />
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          <textarea
            ref={textareaRef}
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={handleKeyDown} // Add keydown handler for Enter key
            placeholder='Ask anything...'
            className='flex-1 px-3 text-lg text-gray-900 bg-transparent border-none focus:ring-0 focus:outline-none resize-none placeholder-gray-600 w-full'
            rows={1}
            style={{ minHeight: '56px', maxHeight: '200px' }} // Adjust max height if needed
          />
        </div>
      </div>
    </form>
  );
};

export default LLMSearchBar;
