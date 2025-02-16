import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCurateAndEmbed } from '../context/curation-and-embedding-context';
import { X } from 'lucide-react';
import Spinner from '@/app/components/spinner';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const EmbeddingProgressDialog = () => {
  const {
    embeddingProgressDialogOpen,
    openEmbeddingProgressDialog,
    embeddingEvent,
    isLoading,
  } = useCurateAndEmbed();

  return (
    <Dialog
      open={embeddingProgressDialogOpen}
      onOpenChange={openEmbeddingProgressDialog}
    >
      <DialogContent className='min-w-[800px] max-h-screen'>
        <DialogHeader>
          <DialogTitle>
            <div className='flex flex-row space-x-1 items-center'>
              <span>Embedding progress</span>
              <Spinner isLoading={isLoading} />
            </div>
          </DialogTitle>
          <DialogDescription>
            Curate and embed data with selected columns of filtered results
          </DialogDescription>
        </DialogHeader>
        <div className='flex flex-col items-center space-y-4  w-full'>
          <div className='flex flex-row justify-between space-x-2 w-full'>
            <Markdown
              className='flex-1   w-full overflow-y-auto overflow-x-auto min-h-80 max-h-80 border rounded-md shadow-md p-2'
              remarkPlugins={[remarkGfm]}
            >
              {embeddingEvent?.originalContent}
            </Markdown>
            <Markdown
              className='flex-1  w-full overflow-y-auto overflow-x-auto min-h-80 max-h-80 border rounded-md shadow-md p-2'
              remarkPlugins={[remarkGfm]}
            >
              {embeddingEvent?.curatedContent}
            </Markdown>
          </div>
          <div className='flex w-full justify-between'>
            <div></div>
            {isLoading ? (
              <Button>
                <X />
                <span>Abort</span>
              </Button>
            ) : (
              <Button>
                <X />
                <span>Close</span>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbeddingProgressDialog;
