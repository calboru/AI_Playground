'use client';
import { AbortableAsyncIterator, ChatResponse } from 'ollama';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  SetStateAction,
  Dispatch,
} from 'react';
import { AskLLMAction } from '../actions/ask-llm-action';
import { useLLM } from '@/context/llm-context';
import { EmbeddingEventType } from '@/types/embedding-event-type';
import { EmbedAllDocumentsAction } from '../actions/embed-document';
import { useQueryStringSearch } from './querystring-search-context';
import { useInfiniteIngestionContent } from './infinite-ingestion-content-context';
import { useToast } from '@/hooks/use-toast';
import { EmbeddingPrompt } from '@/lib/prompts';
import {
  SearchInEuropeanMedicinesAgencyDatabaseAgent,
  SearchInFoodAndDrugAdministrationDatabaseAgent,
} from '../actions/ollama-agents/agents';

interface ICurateAndEmbedContext {
  prompt: string;
  response: string;
  ask: (markdownText: string, prompt: string) => Promise<void>;
  abort: () => void;
  isLoading: boolean;
  userAsked: boolean;
  reset: () => void;
  embedAllDocuments: (
    selectedColumns: string[],
    userPrompt: string
  ) => Promise<void>;
  embeddingEvent: EmbeddingEventType | null;
  curationDialogOpen: boolean;
  openCurationDialog: Dispatch<SetStateAction<boolean>>;
  embeddingProgressDialogOpen: boolean;
  openEmbeddingProgressDialog: Dispatch<SetStateAction<boolean>>;
}

const CurateAndEmbedContext = createContext<ICurateAndEmbedContext | undefined>(
  undefined
);

export const CurateAndEmbedProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { toast } = useToast();
  const [curationDialogOpen, setCurationDialogOpen] = useState(false);
  const [embeddingProgressDialogOpen, setEmbeddingProgressDialogOpen] =
    useState(false);
  const { selectedModel } = useLLM();
  const [prompt, setPrompt] = useState(
    `Replace all null or empty values with 'Not available' in the provided markdown text exactly as given. Output only the modified text.`
  );
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iterator, setIterator] = useState<
    AbortableAsyncIterator<ChatResponse> | ChatResponse | null
  >();
  const [embeddingEvent, setEmbeddingEvent] =
    useState<EmbeddingEventType | null>(null);

  const { searchTerm } = useQueryStringSearch();
  const { selectedIngestion } = useInfiniteIngestionContent();

  const tools = [
    SearchInFoodAndDrugAdministrationDatabaseAgent,
    SearchInEuropeanMedicinesAgencyDatabaseAgent,
  ];

  const handleAsk = async (markdownText: string, prompt: string) => {
    try {
      setIsLoading(true);
      setPrompt(prompt.trim());
      setResponse('');

      const res = (await AskLLMAction(
        selectedModel,
        EmbeddingPrompt(markdownText, prompt),
        tools,
        true
      )) as AbortableAsyncIterator<ChatResponse>;

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
      (iterator as AbortableAsyncIterator<ChatResponse>).abort(); // Abort the async stream
      setIsLoading(false);
      setIterator(null); // Reset iterator
    }
  };

  const handleEmbedAllDocuments = async (
    selectedColumns: string[],
    userPrompt: string
  ) => {
    try {
      setIsLoading(true);
      setCurationDialogOpen(false);
      setEmbeddingProgressDialogOpen(true);

      const streamingResponse = await EmbedAllDocumentsAction(
        searchTerm,
        userPrompt,
        selectedModel,
        selectedIngestion?.index_name ?? '',
        selectedIngestion?.ingestion_description ?? '',
        selectedColumns
      );

      const reader = streamingResponse.getReader();
      const decoder = new TextDecoder('utf8');

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedValue = JSON.parse(
          decoder.decode(value)
        ) as EmbeddingEventType;

        setEmbeddingEvent(() => decodedValue);

        if (decodedValue.finished) {
          setIsLoading(false);
          setEmbeddingProgressDialogOpen(false);
          toast({
            title: 'Embedding',
            description: 'Embedding completed successfully.',
          });
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Unable to ingest files',
        description: JSON.stringify(error),
      });
      setIsLoading(false);
    }
  };

  return (
    <CurateAndEmbedContext.Provider
      value={{
        curationDialogOpen,
        openCurationDialog: setCurationDialogOpen,
        embeddingProgressDialogOpen,
        openEmbeddingProgressDialog: setEmbeddingProgressDialogOpen,
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
        embedAllDocuments: handleEmbedAllDocuments,
        embeddingEvent,
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
