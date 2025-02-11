'use server';

import { LLMType } from '@/app/types/llm-type';
import { LLMClient } from '@/clients/llm-client';

export const GetLLMList: () => Promise<LLMType[]> = async () => {
  const listResponse = await LLMClient.list();
  const modelResponse = listResponse.models;

  const modelNames = modelResponse.map(
    (model) =>
      ({
        modelName: model.name.split(':')[0],
        version: model.name.split(':')[1],
      } as LLMType)
  );
  return modelNames;
};
