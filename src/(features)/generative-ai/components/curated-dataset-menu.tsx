import { Ellipsis, Trash2 } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { RAGDatabaseType } from '../types/rag-database-type';
import { useRAGDatabase } from '../context/rag-database-context';

export function CuratedDatasetMenu({
  RAGDatabase,
}: {
  RAGDatabase: RAGDatabaseType;
}) {
  const { deleteRAGDatabase } = useRAGDatabase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <span>
          <Ellipsis />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-64'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Button
              onClick={() => {
                deleteRAGDatabase(RAGDatabase.rag_index_name);
              }}
              type='button'
              className='text-red-500 hover:text-red-500 '
              variant='ghost'
            >
              <Trash2 />
              <span>Delete</span>
            </Button>
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
