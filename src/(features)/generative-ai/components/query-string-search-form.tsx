import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryStringSearch } from '../context/querystring-search-context';

const searchSchema = z.object({
  searchTerm: z
    .string()
    .min(1, 'Search term is required, check search tips for more information'),
});

const QueryStringSearchForm = () => {
  const { search } = useQueryStringSearch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
  });

  const onSubmit = async (formData: z.infer<typeof searchSchema>) => {
    console.log('Search Query:', formData.searchTerm);
    await search(formData.searchTerm);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex w-full p-1 m-1 items-center space-x-2'
    >
      <div className='w-full'>
        <Input
          placeholder='Keyword search or advanced search: ((quick AND fox) OR (brown AND fox) OR fox)'
          {...register('searchTerm')}
        />
        {errors.searchTerm && (
          <p className='text-red-500 text-sm'>{errors.searchTerm.message}</p>
        )}
      </div>
      <Button type='submit'>
        <Search />
        <span>Search</span>
      </Button>
      <Button type='submit'>
        <X />
        <span>Reset</span>
      </Button>
    </form>
  );
};

export default QueryStringSearchForm;
