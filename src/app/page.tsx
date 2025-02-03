import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Atom,
  Binoculars,
  BrainCircuit,
  Info,
  Plus,
  Search,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <div className='flex flex-col grow h-lvh bg-slate-100'>
      <header className='p-1'>
        <div className='flex flex-row space-y-1 items-center '>
          <BrainCircuit className='h-14 w-14' />
          <div className='p-1 scroll-m-20 font-mono font-extrabold tracking-tight   flex flex-col  '>
            <span className='text-2xl   font-bold '>Generative AI</span>
            <span>with Elastic Search</span>
          </div>
        </div>
      </header>

      <main className='flex flex-row space-x-4 w-full h-lvh p-2  justify-around'>
        <section className='rounded-md max-w-xs flex flex-col space-y-2  bg-white w-full border'>
          <div className='border-b-2     items-center w-full'>
            <div className='p-1'>
              <span className='font-bold text-xl'>Sources</span>
            </div>
          </div>
          <div className='w-full items-center justify-center px-1 flex  '>
            <Button variant='outline' className=''>
              <Plus />
              <span>Upload new</span>
            </Button>
          </div>
        </section>
        <section className='rounded-md flex flex-col space-y-2  bg-white w-full border'>
          <div className='border-b-2     items-center w-full'>
            <div className='p-1 flex justify-between'>
              <span className='font-bold text-xl'>Filter</span>
              <div>
                <Button className='text-blue-600' variant='link'>
                  <Info />
                  <span>View search tips</span>
                </Button>
              </div>
            </div>
          </div>
          <div className='flex w-full p-1  items-center space-x-2'>
            <Input placeholder='Keyword search or advanced search: ((quick AND fox) OR (brown AND fox) OR fox)' />
            <Button type='submit'>
              <Search />
              <span>Search</span>
            </Button>
          </div>
        </section>
      </main>
      <footer className='row-start-3 flex gap-6 flex-wrap items-center justify-center'></footer>
    </div>
  );
}
