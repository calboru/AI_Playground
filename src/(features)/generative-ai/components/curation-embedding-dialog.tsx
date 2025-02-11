import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Combine } from 'lucide-react';
import CurationAndEmbeddingForm from './curation-and-embedding-form';

const CurationEmbeddingDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type='button'>
          <Combine />
          <span>Create Embedding</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-[800px] max-h-screen'>
        <DialogHeader>
          <DialogTitle>Curation & Embedding</DialogTitle>
          <DialogDescription>
            Curate and embed data with selected columns
          </DialogDescription>
        </DialogHeader>
        <CurationAndEmbeddingForm />
      </DialogContent>
    </Dialog>
  );
};

export default CurationEmbeddingDialog;
