'use client';

import executeAgent from '@/(features)/generative-ai/actions/ollama-agents/agent';
import { Button } from '@/components/ui/button';

const App: React.FC = () => {
  const handleWebSearch = async () => {
    const abc = await executeAgent.invoke({
      input: 'is masitinib for ALS a breakthrough therapy?',
    });
    console.log(abc);
  };

  return (
    <div className='min-h-screen bg-gray-50 text-gray-800 font-inter'>
      <Button onClick={() => handleWebSearch()}>This is a test</Button>
    </div>
  );
};

export default App;
