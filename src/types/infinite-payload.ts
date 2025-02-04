export interface InfinitePayload<T> {
  documents: T[];
  cursor: unknown;
  hasMore: boolean;
  totalDocuments: number;
}
