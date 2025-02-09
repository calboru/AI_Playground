'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface IAppContext {
  hello: string;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  useState<Date>(new Date());

  return (
    <AppContext.Provider
      value={{
        hello: 'hello',
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): IAppContext => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
