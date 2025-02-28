import React, { useEffect, useState } from 'react';
import { useAvailableColumns } from '../context/list-available-columns-context';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { useQueryStringSearch } from '../context/querystring-search-context';
import { jsonToMarkdown } from '../actions/convert-json-to-markdown';
import { useCurateAndEmbed } from '../context/curation-and-embedding-context';
import { CircleArrowLeft, CircleArrowRight } from 'lucide-react';

const formSchema = z.object({
  selected_columns: z
    .array(z.string())
    .min(1, 'You have to select at least one item.'),
  prompt: z.string().optional(),
});

const CurationAndEmbeddingForm = () => {
  const [contentIndex, setContentIndex] = useState(0);
  const [markdownText, setMarkdownText] = useState('');
  const { availableColumns, isLoading, fetchAvailableColumns } =
    useAvailableColumns();

  const {
    ask,
    response,
    isLoading: isWorkingOnIt,
    userAsked,
    reset,
    embedAllDocuments,
  } = useCurateAndEmbed();

  const { content } = useQueryStringSearch();

  useEffect(() => {
    (async () => {
      await fetchAvailableColumns();
      setMarkdownText('');
      reset();
    })();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { selected_columns: [] },
  });

  async function onSubmit() {
    const values = form.getValues();
    const { selected_columns, prompt } = values;

    await embedAllDocuments(selected_columns, prompt ?? '');
  }

  const onColumnSelect = () => {
    const selectedCols = form.getValues('selected_columns');
    const converted = jsonToMarkdown(content[contentIndex], selectedCols);
    setMarkdownText(converted);
  };

  const changeRecord = (previous: boolean) => {
    reset();
    if (previous) {
      setContentIndex((prev) => (prev === 0 ? 0 : prev - 1));
    } else {
      setContentIndex((prev) =>
        prev === content.length - 1 ? prev : prev + 1
      );
    }

    const selectedCols = form.getValues('selected_columns');
    const converted = jsonToMarkdown(content[contentIndex], selectedCols);
    setMarkdownText(converted);
  };

  const handlePreview = async (prompt: string) => {
    if (!prompt?.trim()) {
      form.clearErrors('prompt'); // Clear first to ensure UI updates
      setTimeout(
        () =>
          form.setError('prompt', { message: 'Prompt is required to preview' }),
        10
      );
      return;
    }
    const selectedCols = form.getValues('selected_columns');
    if (selectedCols?.length === 0) {
      form.clearErrors('selected_columns'); // Clear first to ensure UI updates
      setTimeout(
        () =>
          form.setError('selected_columns', {
            message: 'At least one column must be selected',
          }),
        10
      );
      return;
    }
    form.clearErrors('selected_columns');
    form.clearErrors('prompt');
    await ask(markdownText, prompt);
  };

  if (isLoading) {
    return <Spinner isLoading={isLoading} />;
  }

  return (
    <Form {...form}>
      <form className='flex flex-col space-y-1 bg-slate-100 rounded-md text-sm  w-full'>
        {/* Display Error Message at the Top */}
        {(form.formState.errors?.prompt ||
          form.formState.errors?.selected_columns) && (
          <div className='p-2 m-1 bg-red-100 text-red-700 border border-red-300 rounded-md'>
            {form.formState.errors?.selected_columns?.message}
            {form.formState?.errors?.prompt?.message}
          </div>
        )}

        {/* Grid Layout */}
        <div className='flex flex-row space-x-2 p-2 text-sm w-full'>
          {/* Available Columns */}
          <div className='p-2 border rounded shadow w-1/2 bg-white'>
            <div className='border-b-2 font-bold text-blue-500 p-1'>
              Available Data Points
            </div>
            <div className='overflow-y-auto max-h-80 p-2'>
              {availableColumns.map((item) => (
                <FormField
                  key={item.column_name}
                  control={form.control}
                  name='selected_columns'
                  render={({ field }) => (
                    <FormItem className='flex items-center space-x-2 w-full p-1'>
                      <FormControl>
                        <Checkbox
                          disabled={isWorkingOnIt || isLoading}
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
                            onColumnSelect();
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
            <div className='flex flex-row justify-between border-b-2 p-1 '>
              <span className='font-bold text-blue-500'>Preview</span>
              <div className='flex flex-row space-x-2 items-center '>
                <CircleArrowLeft
                  onClick={() => changeRecord(true)}
                  className='w-5 h-5'
                />
                <CircleArrowRight
                  onClick={() => changeRecord(false)}
                  className='w-5 h-5'
                />
              </div>
            </div>
            <Markdown
              className='w-full max-w-[300px]  overflow-y-auto overflow-x-auto max-h-80'
              remarkPlugins={[remarkGfm]}
            >
              {!userAsked ? markdownText : response}
            </Markdown>
          </div>
        </div>

        {/* Curation Prompt */}
        <div className='flex flex-col space-y-3 m-2 p-2 border rounded shadow bg-white'>
          <div className='border-b-2 font-bold'>
            <span className='text-blue-500'>Curation prompt</span>
          </div>
          <FormField
            control={form.control}
            name='prompt'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Enter your prompt for curation'
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Buttons */}
        <div className='flex justify-end items-center p-2 space-x-2'>
          <div className='flex flex-row space-x-2 items-center rounded-md shadow border bg-white p-1'>
            <span className='font-bold'>Select LLM:</span>
            <LLMModelListDropdown />
          </div>
          <Button
            disabled={isWorkingOnIt || isLoading}
            onClick={() => handlePreview(form.getValues('prompt') ?? '')}
            type='button'
          >
            {<Spinner isLoading={isWorkingOnIt} />}
            Preview curation
          </Button>
          <Button
            onClick={onSubmit}
            type='button'
            disabled={isWorkingOnIt || isLoading}
          >
            Run
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CurationAndEmbeddingForm;
