import { Button } from '@/components/ui/button';
import { Info, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
const IngestedContent = () => {
  return (
    <section className='rounded-md flex flex-col space-y-2  bg-white w-full border'>
      <div className='border-b-2     items-center w-full'>
        <div className='p-1 flex justify-between'>
          <span className='font-bold text-xl font-mono'>Ingested Content</span>
          <div>
            <Button className='text-blue-600' variant='link'>
              <Info />
              <span>View search tips</span>
            </Button>
          </div>
        </div>
      </div>
      <div className='flex w-full p-1  items-center space-x-2'>
        <Input placeholder='Keyword search or advanced search: ((quick AND fox) OR (brown AND fox) OR fox)' />
        <Button type='submit'>
          <Search />
          <span>Search</span>
        </Button>
      </div>
    </section>
  );
};

export default IngestedContent;
