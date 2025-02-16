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
import { useCurateAndEmbed } from '../context/curation-and-embedding-context';

const CurationEmbeddingDialog = () => {
  const { curationDialogOpen, openCurationDialog } = useCurateAndEmbed();

  return (
    <Dialog open={curationDialogOpen} onOpenChange={openCurationDialog}>
      <DialogTrigger asChild>
        <Button
          onClick={() => openCurationDialog(curationDialogOpen)}
          type='button'
        >
          <Combine />
          <span>Create Embedding</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='min-w-[800px] max-h-screen'>
        <DialogHeader>
          <DialogTitle>Curation & Embedding</DialogTitle>
          <DialogDescription>
            Curate and embed data with selected columns of filtered results
          </DialogDescription>
        </DialogHeader>
        <CurationAndEmbeddingForm />
      </DialogContent>
    </Dialog>
  );
};

export default CurationEmbeddingDialog;
