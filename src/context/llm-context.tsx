'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GetLLMList } from '../actions/get-llm-list';
import { LLMType } from '@/app/types/llm-type';

interface ILLMContext {
  defaultModel: string;
  setDefaultModel: (modelName: string) => void;
  getListOfModels: () => void;
  listOfModels: LLMType[];
  isLoading: boolean;
}

const LLMContext = createContext<ILLMContext | undefined>(undefined);

export const LLMProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [defaultModel, setDefaultModel] = useState<string>('zephyr');
  const [listOfModels, setListOfModels] = useState<LLMType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleGetListOfModels = async () => {
    try {
      setIsLoading(true);
      const models = await GetLLMList();
      setListOfModels(models);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const context: ILLMContext = {
    defaultModel,
    listOfModels,
    isLoading,
    setDefaultModel: setDefaultModel,
    getListOfModels: handleGetListOfModels,
  };

  return <LLMContext.Provider value={context}>{children}</LLMContext.Provider>;
};

export const useLLM = (): ILLMContext => {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error('useLLM must be used within a LLMProvider');
  }
  return context;
};
