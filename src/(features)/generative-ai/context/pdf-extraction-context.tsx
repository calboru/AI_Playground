'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

//TODO: This is a place holder for PDF dialog

interface PDFExtractionContextProps {
  extractedText: string;
  extractTextFromPDF: (file: File) => Promise<void>;
}

const PDFExtractionContext = createContext<
  PDFExtractionContextProps | undefined
>(undefined);

export const PDFExtractionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [extractedText, setExtractedText] = useState<string>('');

  const extractTextFromPDF = async (file: File) => {
    console.log('extractTextFromPDF', file, extractedText);
    setExtractedText('Extracted text');
  };

  return (
    <PDFExtractionContext.Provider
      value={{ extractedText, extractTextFromPDF }}
    >
      {children}
    </PDFExtractionContext.Provider>
  );
};

export const usePDFExtract = (): PDFExtractionContextProps => {
  const context = useContext(PDFExtractionContext);
  if (!context) {
    throw new Error(
      'usePDFExtract must be used within a PDFExtractionProvider'
    );
  }
  return context;
};
