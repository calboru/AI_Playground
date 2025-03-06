'use client';

import { Button } from '@/components/ui/button';

const App: React.FC = () => {
  const handleWebSearch = async () => {};

  return (
    <div className='min-h-screen bg-gray-50 text-gray-800 font-inter'>
      <Button onClick={() => handleWebSearch()}>This is a test</Button>
    </div>
  );
};

export default App;
