'use client';
import { AbortableAsyncIterator, ChatResponse } from 'ollama';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AskLLMAction } from '../actions/ask-llm-action';
import { useLLM } from '@/context/llm-context';

interface ICurateAndEmbedContext {
  prompt: string;
  response: string;
  ask: (prompt: string) => Promise<void>;
  abort: () => void;
  isLoading: boolean;
  userAsked: boolean;
  reset: () => void;
}

const CurateAndEmbedContext = createContext<ICurateAndEmbedContext | undefined>(
  undefined
);

export const CurateAndEmbedProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { selectedModel } = useLLM();
  const [prompt, setPrompt] = useState(
    `Replace all null or empty values with 'Not available' in the provided markdown text exactly as given. Output only the modified text.`
  );
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iterator, setIterator] =
    useState<AbortableAsyncIterator<ChatResponse> | null>(null);

  const handleAsk = async (prompt: string) => {
    try {
      setIsLoading(true);
      setPrompt(prompt.trim());
      setResponse('');

      const res = await AskLLMAction(selectedModel, prompt);
      setIterator(res); // Store the iterator for aborting later

      for await (const chunk of res) {
        setResponse((prev) => prev + chunk.message.content);
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const handleAbort = () => {
    if (iterator) {
      iterator.abort(); // Abort the async stream
      setIsLoading(false);
      setIterator(null); // Reset iterator
    }
  };

  return (
    <CurateAndEmbedContext.Provider
      value={{
        userAsked: prompt?.length > 0,
        reset: () => {
          setPrompt('');
          setResponse('');
        },
        ask: handleAsk,
        abort: handleAbort,
        prompt,
        response,
        isLoading,
      }}
    >
      {children}
    </CurateAndEmbedContext.Provider>
  );
};

export const useCurateAndEmbed = () => {
  const context = useContext(CurateAndEmbedContext);
  if (!context) {
    throw new Error(
      'useCurateAndEmbed must be used within a CurateAndEmbedProvider'
    );
  }
  return context;
};
