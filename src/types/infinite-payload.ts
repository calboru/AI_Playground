export interface InfinitePayload<T> {
  documents: T[];
  cursor: number;
  hasMore: boolean;
  totalDocuments: number;
}
