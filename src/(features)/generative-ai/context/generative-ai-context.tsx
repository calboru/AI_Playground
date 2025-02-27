'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface GenerativeAIContextProps {
  data: string;
  setData: React.Dispatch<React.SetStateAction<string>>;
}

const GenerativeAIContext = createContext<GenerativeAIContextProps | undefined>(
  undefined
);

export const GenerativeAIProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<string>('');

  return (
    <GenerativeAIContext.Provider value={{ data, setData }}>
      {children}
    </GenerativeAIContext.Provider>
  );
};

export const useGenerativeAI = (): GenerativeAIContextProps => {
  const context = useContext(GenerativeAIContext);
  if (!context) {
    throw new Error(
      'useGenerativeAI must be used within a GenerativeAIProvider'
    );
  }
  return context;
};
