'use client';
import React, { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Link, ClipboardList, Trash2 } from 'lucide-react';
import { useIngestion } from '@/(features)/generative-ai/context/ingestion-context';
const IngestionUploadDialog = () => {
  const { openIngestionDialog, ingestionDialogOpen, bulkIndexCSV } =
    useIngestion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles([...files, ...Array.from(event.target.files)]);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(files.filter((file) => file.name !== fileName));
  };

  const handleStartIngestion = async () => {
    await bulkIndexCSV('test', files);
  };

  return (
    <Dialog open={ingestionDialogOpen} onOpenChange={openIngestionDialog}>
      <DialogTrigger asChild>
        <Button
          onClick={() => openIngestionDialog(!openIngestionDialog)}
          variant='outline'
          className='grow mt-1 mr-3 ml-3'
        >
          <Upload />
          <span>Create new</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-[700px]'>
        <DialogHeader>
          <DialogTitle>Create Ingestion</DialogTitle>
          <DialogDescription>
            Sources let generative AI base its responses on the information that
            matters most to you.
          </DialogDescription>
        </DialogHeader>

        <div className='w-full mx-auto border bg-white shadow rounded-2xl p-6'>
          <div className='grid w-full '>
            <Label
              className='font-bold items-center flex'
              htmlFor='description'
            >
              <span className='text-red-500 text-lg'>*</span>
              Description
            </Label>
            <Textarea
              maxLength={200}
              placeholder='Add a short description about the ingestion sources'
              id='description'
            />
          </div>
          <div className='mt-4 border border-dashed border-gray-300 rounded-lg p-1 flex flex-col items-center'>
            <Upload className='w-8 h-8 text-gray-500' />
            <p className='mt-2 text-gray-600'>Upload sources</p>
            <p className='text-xs text-gray-500'>
              Drag & drop or{' '}
              <span
                onClick={handleFileClick}
                className='text-blue-500 cursor-pointer'
              >
                choose file
              </span>{' '}
              to upload
              <input
                onChange={handleFileChange}
                type='file'
                ref={fileInputRef}
                className='hidden'
                multiple
              />
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              Supported file types: CSV, .txt, Markdown, Google Docs, PDF, Word
            </p>
          </div>

          <div className='mt-4 grid grid-cols-3 gap-3'>
            <div className='bg-gray-100 p-4 rounded-lg flex flex-col items-center'>
              <FileText className='w-6 h-6 text-gray-600' />
              <p className='text-xs text-gray-600 mt-1'>Google Docs</p>
            </div>
            <div className='bg-gray-100 p-4 rounded-lg flex flex-col items-center'>
              <Link className='w-6 h-6 text-gray-600' />
              <p className='text-xs text-gray-600 mt-1'>Website</p>
            </div>
            <div className='bg-gray-100 p-4 rounded-lg flex flex-col items-center'>
              <ClipboardList className='w-6 h-6 text-gray-600' />
              <p className='text-xs text-gray-600 mt-1'>Copied text</p>
            </div>
          </div>

          <div className='mt-4 text-gray-500 text-xs flex justify-between'>
            <span onClick={() => openIngestionDialog(false)}>Source limit</span>
            <span>{files.length} / 50</span>
          </div>
          {files.length > 0 && (
            <div className='mt-4 p-2 bg-gray-100 rounded-lg'>
              <p className='text-sm font-medium text-gray-700'>
                Selected Files:
              </p>
              <ul className='mt-2 space-y-2 max-h-40 overflow-y-scroll bg-white p-2 rounded-lg shadow-inner scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200'>
                {files.map((file, index) => (
                  <li
                    key={index}
                    className='flex justify-between items-center p-2 border rounded-md'
                  >
                    <span className='text-sm text-gray-700 truncate'>
                      {file.name}
                    </span>
                    <button
                      onClick={() => removeFile(file.name)}
                      className='text-red-500 hover:text-red-700'
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleStartIngestion}
            disabled={files.length < 1}
            type='submit'
          >
            Start ingestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IngestionUploadDialog;
