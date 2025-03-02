'use client';
import React, {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { useInfiniteRAGDatabases } from './infinite-rag-databases-context';
import { ChatWithDatabaseAction } from '../actions/chat-with-database-action';
import { jsonToMarkdown } from '../actions/convert-json-to-markdown';
import { useLLM } from '@/context/llm-context';
import { ChatEntry } from '../types/chat-entry-type';

// Define the chat entry type for history

// Update the context interface to include chat history
interface IChatWithDatabaseContext {
  chatResponse: string;
  userPrompt: string;
  setUserPrompt: Dispatch<SetStateAction<string>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  ask: () => void;
  isThinking: boolean;
  ragSources: string[];
  chatHistory: ChatEntry[];
  clearChatHistory: () => void; // Optional: to reset history
}

const ChatWithDatabaseContext = createContext<
  IChatWithDatabaseContext | undefined
>(undefined);

export const useChatWithDatabase = () => {
  const context = useContext(ChatWithDatabaseContext);
  if (!context) {
    throw new Error(
      'useChatWithDatabase must be used within a ChatWithDatabaseProvider'
    );
  }
  return context;
};

export const ChatWithDatabaseProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [chatResponse, setChatResponse] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]); // Initialize chat history
  const { selectedRAGDatabase } = useInfiniteRAGDatabases();
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [ragSources, setRagSources] = useState<string[]>([]);
  const { selectedModel } = useLLM();
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAsk = async () => {
    try {
      setRagSources([]);
      setIsThinking(true);
      setChatResponse('');

      const promptTime = new Date().toISOString();

      setChatHistory((prev) => {
        const existingEntryIndex = prev.findIndex(
          (entry) =>
            entry.prompt === userPrompt && entry.timestamp === promptTime
        );
        if (existingEntryIndex !== -1) {
          const updatedHistory = [...prev];
          updatedHistory[existingEntryIndex].response = '';
          updatedHistory[existingEntryIndex].timestamp = promptTime;
          return updatedHistory;
        }
        return [
          ...prev,
          {
            prompt: userPrompt,
            response: '',
            timestamp: promptTime,
          },
        ];
      });

      const chatStream = await ChatWithDatabaseAction(
        selectedRAGDatabase?.rag_index_name ?? '',
        userPrompt,
        selectedModel,
        searchTerm,
        chatHistory
      );
      if (!chatStream) {
        return;
      }
      const reader = chatStream.getReader();
      const decoder = new TextDecoder('utf8');
      let fullResponse = '';

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        const decodedValue = JSON.parse(decoder.decode(value));

        //RETRIEVED CONTEXT
        if (decodedValue?.context) {
          (decodedValue?.context ?? []).forEach((source: string) => {
            setRagSources((prev) => [...prev, jsonToMarkdown(source)]);
          });
        }

        if (decodedValue?.answer) {
          fullResponse += decodedValue.answer;
          setChatResponse((prev) => prev + decodedValue.answer);
        }
      }

      setChatResponse('');
      setChatHistory((prev) => {
        const existingEntryIndex = prev.findIndex(
          (entry) =>
            entry.prompt === userPrompt && entry.timestamp === promptTime
        );

        const updatedHistory = [...prev];
        updatedHistory[existingEntryIndex].response = fullResponse;
        updatedHistory[existingEntryIndex].timestamp = promptTime;
        return updatedHistory;
      });
      // // Add the prompt and response to chat history
      setUserPrompt('');
      setSearchTerm('');

      setIsThinking(false);
    } catch (error) {
      setIsThinking(false);
      console.log(error);
    }
  };

  // Function to clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
    setChatResponse('');
    setRagSources([]);
    setSearchTerm('');
  };

  return (
    <ChatWithDatabaseContext.Provider
      value={{
        ragSources,
        isThinking,
        chatResponse,
        ask: handleAsk,
        userPrompt,
        setUserPrompt,
        searchTerm,
        setSearchTerm,
        chatHistory,
        clearChatHistory,
      }}
    >
      {children}
    </ChatWithDatabaseContext.Provider>
  );
};
