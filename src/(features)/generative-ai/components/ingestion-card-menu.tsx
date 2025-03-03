import { Ellipsis, Plus, Trash2 } from 'lucide-react';

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
import { useIngestion } from '../context/ingestion-context';
import { useInfiniteIngestionContent } from '../context/infinite-ingestion-content-context';
import { IngestionType } from '../types/ingestion-type';
export function IngestionCardMenu({ ingestion }: { ingestion: IngestionType }) {
  const { openIngestionDialog, deleteIngestion } = useIngestion();
  const { selectIngestion } = useInfiniteIngestionContent();

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
                selectIngestion(ingestion);
                openIngestionDialog(true);
              }}
              variant='ghost'
              type='button'
            >
              <Plus />
              <span>Add more source</span>
            </Button>

            <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Button
              onClick={() => {
                deleteIngestion(ingestion.index_name);
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
