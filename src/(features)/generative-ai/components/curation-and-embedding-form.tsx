import React, { useEffect } from 'react';
import { useAvailableColumns } from '../context/list-available-columns-context';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Checkbox } from '@/components/ui/checkbox';
import Spinner from '@/app/components/spinner';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import LLMModelListDropdown from '@/components/llm-dropdown';

const formSchema = z.object({
  selected_columns: z
    .array(z.string())
    .min(1, 'You have to select at least one item.'),
});

const CurationAndEmbeddingForm = () => {
  const { availableColumns, isLoading, fetchAvailableColumns } =
    useAvailableColumns();

  useEffect(() => {
    (async () => {
      await fetchAvailableColumns();
    })();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { selected_columns: [] },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  if (isLoading) {
    return <Spinner isLoading={isLoading} />;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col space-y-1 bg-slate-100 rounded-md text-sm w-full'
      >
        {/* Grid Layout */}
        <div className='flex flex-row space-x-2 p-2  text-sm w-full'>
          {/* Available Columns */}
          <div className='p-2 border rounded shadow w-1/2 bg-white'>
            <div className='border-b-2 font-bold'>Available Columns</div>
            <div className='overflow-y-auto max-h-80  p-2'>
              {availableColumns.map((item) => (
                <FormField
                  key={item.column_name}
                  control={form.control}
                  name='selected_columns'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2 w-full p-1'>
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.column_name)}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...field.value, item.column_name]
                                : field.value.filter(
                                    (value: string) =>
                                      value !== item.column_name
                                  )
                            );
                          }}
                        />
                      </FormControl>
                      <FormLabel>{item.column_name}</FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>
          </div>

          {/* Data Display */}
          <div className='flex flex-col space-y-3 p-2 border rounded shadow bg-white w-1/2'>
            <span className='border-b-2 font-bold'>Data</span>
            <Markdown
              className='w-full overflow-auto'
              remarkPlugins={[remarkGfm]}
            >
              {
                '**Bold Text**\n\n- List item 1\n- List item 2\n\n[Link](https://example.com)'
              }
            </Markdown>
          </div>
        </div>
        <div className='flex flex-col space-y-3 m-2 p-2 border rounded shadow bg-white  '>
          <div className='border-b-2 font-bold '>
            <div>Curation prompt</div>
          </div>
          <Textarea />
        </div>
        {/* Buttons */}
        <div className='flex justify-end p-2 space-x-2 '>
          <div className='flex flex-row space-x-2 items-center  '>
            <span className='font-bold'>Select LLM:</span>
            <LLMModelListDropdown />
          </div>
          <FormMessage />
          <Button type='submit'>Dry-run</Button>
          <Button type='submit'>Run</Button>
        </div>
      </form>
    </Form>
  );
};

export default CurationAndEmbeddingForm;
