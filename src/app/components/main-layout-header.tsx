import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Share } from 'lucide-react';

import GenerativeAILogo from '@/(features)/generative-ai/components/generative-ai-logo';

const MainLayoutHeader = () => {
  return (
    <header className='bg-white  dark:bg-gray-800/80 m-1 border shadow-lg rounded-xl border-slate-300  px-6 py-3 flex items-center justify-between'>
      <GenerativeAILogo />

      <div className='flex items-center gap-3'>
        <Button className='bg-blue-600 hover:bg-blue-700 text-white'>
          <Share className='w-4 h-4 mr-1' /> Ingest
        </Button>
        <Button className='bg-purple-600 hover:bg-purple-700 text-white'>
          <MessageCircle className='w-4 h-4 mr-1' /> Chat
        </Button>
      </div>
    </header>
  );
};

export default MainLayoutHeader;
