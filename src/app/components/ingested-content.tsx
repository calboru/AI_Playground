import InfiniteIngestionContent from '@/(features)/generative-ai/components/infinite-ingestion-content';
import { useInfiniteIngestionContent } from '@/(features)/generative-ai/context/infinite-ingestion-content-context';

import QueryStringSearchForm from '@/(features)/generative-ai/components/query-string-search-form';
import { useQueryStringSearch } from '@/(features)/generative-ai/context/querystring-search-context';
import InfiniteSearchResults from '@/(features)/generative-ai/components/infinite-search-results';
import EmbeddingProgressDialog from '@/(features)/generative-ai/components/embedding-progress-dialog';
import CurationEmbeddingDialog from '@/(features)/generative-ai/components/curation-embedding-dialog';
import AvailableColumnsSheet from '@/(features)/generative-ai/components/available-columns-sheet';
import { Info } from 'lucide-react';
import Link from 'next/link';
const IngestedContent = () => {
  const { selectedIngestion } = useInfiniteIngestionContent();
  const { searchIsPerformed, totalDocuments, took } = useQueryStringSearch();

  return (
    <section className='flex flex-col space-y-4 m-1 w-full  '>
      <div className='rounded-xl  p-4   bg-white  border border-slate-300 items-center w-full'>
        <div className='flex flex-row space-x-6 justify-end'>
          <AvailableColumnsSheet />
          <Link
            target='_blank'
            href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html'
            className='text-blue-500 text-sm font-extralight flex flex-row cursor-pointer  space-x-1 border-b-2   items-center'
          >
            <Info className='h-4 w-4' />
            <span>View search tips</span>
          </Link>
        </div>
        <div className='p-2 flex flex-row justify-between'>
          <div className='flex flex-row space-x-1 items-center'>
            <span className='font-bold text-xl text-orange-600'>
              Search in:
            </span>
            <span className='text-orange-600  text-xl'>
              {selectedIngestion?.ingestion_description}
            </span>
          </div>
        </div>
        <QueryStringSearchForm />
      </div>

      {searchIsPerformed && (
        <div className='flex flex-row justify-between items-center p-1 m-1'>
          <div>{searchIsPerformed && <CurationEmbeddingDialog />}</div>
          <div className='flex p-1 ml-2 mr-2 font-bold text-sm text-red-500  '>
            Found {totalDocuments.toLocaleString()} documents in {took}ms
          </div>
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
