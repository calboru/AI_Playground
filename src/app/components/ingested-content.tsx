import { Button } from '@/components/ui/button';
import { Info, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import InfiniteIngestionContent from '@/(features)/generative-ai/components/infinite-ingestion-content';
import { useInfiniteIngestionContent } from '@/(features)/generative-ai/context/infinite-ingestion-content-context';
import Spinner from './spinner';
const IngestedContent = () => {
  const { isLoading, selectedIngestion } = useInfiniteIngestionContent();

  return (
    <section className='rounded-md flex flex-col space-y-2  bg-white w-full border'>
      <div className='border-b-2     items-center w-full'>
        <div className='p-1 flex justify-between'>
          <div className='flex flex-row'>
            <span className='font-bold text-xl font-mono'>Content</span>
            <Spinner isLoading={isLoading} />
          </div>

          <div>
            <Button className='text-blue-600 text-sm' variant='link'>
              <Info />
              <span>View search tips</span>
            </Button>
          </div>
        </div>
      </div>

      <p className='text-sm border rounded shadow m-2 bg-gray-100 p-1 font-extralight text-gray-700'>
        <span className='font-semibold'>Content Description:</span>
        {selectedIngestion?.ingestion_description}
      </p>

      <div className='flex w-full p-1 m-1 items-center space-x-2'>
        <Input placeholder='Keyword search or advanced search: ((quick AND fox) OR (brown AND fox) OR fox)' />
        <Button type='submit'>
          <Search />
          <span>Search</span>
        </Button>
      </div>

      <div className='w-full overflow-y-auto '>
        <InfiniteIngestionContent />
      </div>
    </section>
  );
};

export default IngestedContent;
