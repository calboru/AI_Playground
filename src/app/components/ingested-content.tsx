import InfiniteIngestionContent from '@/(features)/generative-ai/components/infinite-ingestion-content';
import { useInfiniteIngestionContent } from '@/(features)/generative-ai/context/infinite-ingestion-content-context';
import Spinner from './spinner';
import QueryStringSearchForm from '@/(features)/generative-ai/components/query-string-search-form';
import { useQueryStringSearch } from '@/(features)/generative-ai/context/querystring-search-context';
import InfiniteSearchResults from '@/(features)/generative-ai/components/infinite-search-results';
import EmbeddingProgressDialog from '@/(features)/generative-ai/components/embedding-progress-dialog';
const IngestedContent = () => {
  const { isLoading, selectedIngestion } = useInfiniteIngestionContent();
  const { searchIsPerformed, isSearching, totalDocuments, took } =
    useQueryStringSearch();
  const combinedLoading = isLoading || isSearching;

  return (
    <section className='rounded-md flex flex-col space-y-2  bg-white w-full border'>
      <div className='border-b-2     items-center w-full'>
        <div className='p-1 flex justify-between'>
          <div className='flex flex-row'>
            <span className='font-bold text-xl font-mono'>Content</span>
            <Spinner isLoading={combinedLoading} />
          </div>
        </div>
      </div>

      <p className='text-sm border rounded shadow m-2 bg-gray-100 p-1 font-extralight text-gray-700'>
        <span className='font-semibold'>Content Description:</span>
        {selectedIngestion?.ingestion_description}
      </p>

      <QueryStringSearchForm />

      {searchIsPerformed && (
        <div className='flex w-full p-1 ml-2 mr-2 font-bold text-sm text-red-500 '>
          Found {totalDocuments.toLocaleString()} documents in {took}ms
        </div>
      )}

      <div className='w-full overflow-y-auto '>
        {!searchIsPerformed && <InfiniteIngestionContent />}
        {searchIsPerformed && <InfiniteSearchResults />}
      </div>
      <EmbeddingProgressDialog />
    </section>
  );
};

export default IngestedContent;
