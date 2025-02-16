export type EmbeddingEventType = {
  message: string;
  originalContent: string;
  curatedContent: string;
  finished: boolean;
  startDate: Date;
  endDate: Date | null;
  failed: boolean;
  error: string;
  totalDocument: number;
  currentDocumentIndex: number;
};
