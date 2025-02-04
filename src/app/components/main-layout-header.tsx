import React from 'react';
import { BrainCircuit } from 'lucide-react';
const MainLayoutHeader = () => {
  return (
    <header className='p-1'>
      <div className='flex flex-row space-y-1 items-center '>
        <BrainCircuit className='h-14 w-14' />
        <div className='p-1 scroll-m-20 font-mono font-extrabold tracking-tight   flex flex-col  '>
          <span className='text-2xl   font-bold '>Generative AI</span>
          <span>with Elastic Search</span>
        </div>
      </div>
    </header>
  );
};

export default MainLayoutHeader;
