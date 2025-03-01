// Interface for the Document type (based on langchain/document)
export interface IDocumentData {
  pageContent: string; // Content of the document (e.g., compound, price, etc.)
  metadata: Record<string, unknown>; // Metadata associated with the document
  id?: string; // Optional document ID
}

// Interface for the RAG response
export interface IRAGResponse {
  question: string; // System prompt + user question
  context: IDocumentData[]; // Array of retrieved documents
  answer: string; // LLM's answer based on the context
}
