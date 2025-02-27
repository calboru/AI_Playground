import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryStringSearch } from '../context/querystring-search-context';
import Spinner from '@/app/components/spinner';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';

const searchSchema = z.object({
  searchTerm: z
    .string()
    .min(1, 'Search term is required, check search tips for more information'),
});

const QueryStringSearchForm = () => {
  const { search, resetSearch, searchIsPerformed, isSearching } =
    useQueryStringSearch();
  const { isLoading } = useInfiniteIngestionContent();
  const combinedLoading = isLoading || isSearching;

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
      className='flex w-full p-2 items-center space-x-2  '
    >
      <div className='w-full items-center   '>
        <div className='flex w-full flex-row space-x-1'>
          <Input
            disabled={combinedLoading}
            className='border text-blue-500  font-extrabold border-blue-500'
            placeholder='Keyword search or advanced search: ((quick AND fox) OR (brown AND fox) OR fox)'
            {...register('searchTerm')}
          />
          <Button
            disabled={combinedLoading}
            className='bg-orange-500 hover:bg-orange-700 text-white'
            type='submit'
          >
            {combinedLoading && <Spinner isLoading={combinedLoading} />}
            {!combinedLoading && <Search />}
            <span>Search</span>
          </Button>
          {searchIsPerformed && (
            <Button type='reset' disabled={combinedLoading} onClick={onReset}>
              <X />
              <span>Reset</span>
            </Button>
          )}
        </div>

        {errors.searchTerm && (
          <p className='text-red-500 text-sm p-1'>
            {errors.searchTerm.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default QueryStringSearchForm;
