import { useLLM } from '@/context/llm-context';
import React, { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const LLMModelListDropdown = () => {
  const {
    isLoading,
    getListOfModels,
    listOfModels,
    defaultModel,
    setDefaultModel,
  } = useLLM();

  useEffect(() => {
    const fetchData = async () => {
      await getListOfModels();
    };

    fetchData();
  }, []);

  return (
    <Select value={defaultModel} onValueChange={(e) => setDefaultModel(e)}>
      <SelectTrigger className='w-[180px]'>
        <SelectValue>{defaultModel || 'Select LLM'}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {!isLoading &&
          listOfModels.map((model) => {
            const modelValue = `${model.modelName}-${model.version}`;
            return (
              <SelectItem key={modelValue} value={modelValue}>
                {modelValue}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};

export default LLMModelListDropdown;
