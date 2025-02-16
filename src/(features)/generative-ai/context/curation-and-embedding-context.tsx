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

interface ICurateAndEmbedContext {
  prompt: string;
  response: string;
  ask: (prompt: string) => Promise<void>;
  abort: () => void;
  isLoading: boolean;
  userAsked: boolean;
  reset: () => void;
  embedAllDocuments: (selectedColumns: string[]) => Promise<void>;
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
  const [curationDialogOpen, setCurationDialogOpen] = useState(false);
  const [embeddingProgressDialogOpen, setEmbeddingProgressDialogOpen] =
    useState(false);
  const { selectedModel } = useLLM();
  const [prompt, setPrompt] = useState(
    `Replace all null or empty values with 'Not available' in the provided markdown text exactly as given. Output only the modified text.`
  );
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iterator, setIterator] =
    useState<AbortableAsyncIterator<ChatResponse> | null>(null);
  const [embeddingEvent, setEmbeddingEvent] =
    useState<EmbeddingEventType | null>(null);

  const { searchTerm } = useQueryStringSearch();
  const { selectedIngestion } = useInfiniteIngestionContent();

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

  const handleEmbedAllDocuments = async (selectedColumns: string[]) => {
    try {
      setIsLoading(true);
      setCurationDialogOpen(false);
      setEmbeddingProgressDialogOpen(true);
      const streamingResponse = await EmbedAllDocumentsAction(
        searchTerm,
        prompt,
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

        console.log('DECODE', decodedValue);

        setEmbeddingEvent(() => decodedValue);

        if (decodedValue.finished || decodedValue.failed) {
          setIsLoading(false);
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error(error);
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
