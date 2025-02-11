import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Info, Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryStringSearch } from '../context/querystring-search-context';
import AvailableColumnsSheet from './available-columns-sheet';
import CurationEmbeddingDialog from './curation-embedding-dialog';

const searchSchema = z.object({
  searchTerm: z
    .string()
    .min(1, 'Search term is required, check search tips for more information'),
});

const QueryStringSearchForm = () => {
  const { search, resetSearch, searchIsPerformed } = useQueryStringSearch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = async (formData: z.infer<typeof searchSchema>) => {
    search(formData.searchTerm, true);
  };

  const onReset = async () => {
    reset();
    resetSearch();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex w-full p-1 m-1  items-baseline  space-x-2  '
    >
      <div className='w-full'>
        <div className='flex flex-col space-y-1'>
          <Input
            placeholder='Keyword search or advanced search: ((quick AND fox) OR (brown AND fox) OR fox)'
            {...register('searchTerm')}
          />
          <div className='flex w-full justify-between'>
            <div></div>
            <div className='flex flex-row space-x-4'>
              <AvailableColumnsSheet />
              <span className='text-blue-500 text-sm font-extralight flex flex-row cursor-pointer  space-x-1 border-b-2   items-center'>
                <Info className='h-4 w-4' />
                <span>View search tips</span>
              </span>
            </div>
          </div>
        </div>

        {errors.searchTerm && (
          <p className='text-red-500 text-sm'>{errors.searchTerm.message}</p>
        )}
      </div>
      <Button type='submit'>
        <Search />
        <span>Search</span>
      </Button>
      <Button type='reset' onClick={onReset}>
        <X />
        <span>Reset</span>
      </Button>
      {searchIsPerformed && <CurationEmbeddingDialog />}
    </form>
  );
};

export default QueryStringSearchForm;
