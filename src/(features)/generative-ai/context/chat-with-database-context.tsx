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

// Define the chat entry type for history
interface ChatEntry {
  prompt: string;
  response: string;
  timestamp: string; // Optional: for sorting or display purposes
}

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

  console.log('history', chatHistory);

  const handleAsk = async () => {
    try {
      setIsThinking(true);
      setChatResponse('');
      const chatStream = await ChatWithDatabaseAction(
        selectedRAGDatabase?.rag_index_name ?? '',
        userPrompt,
        selectedModel,
        searchTerm
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

      // Add the prompt and response to chat history
      setChatHistory((prev) => [
        ...prev,
        {
          prompt: userPrompt,
          response: fullResponse,
          timestamp: new Date().toISOString(),
        },
      ]);

      setUserPrompt(''); // Clear the prompt after submission
      setSearchTerm(''); // Clear the search term
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
        chatHistory, // Provide chat history
        clearChatHistory, // Provide clear history function
      }}
    >
      {children}
    </ChatWithDatabaseContext.Provider>
  );
};
