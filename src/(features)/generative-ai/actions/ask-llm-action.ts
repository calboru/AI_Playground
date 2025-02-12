'use server';
import { LLMClient } from '@/clients/llm-client';

export const AskLLMAction = async (defaultModel: string, prompt: string) => {
  try {
    return await LLMClient.chat({
      model: defaultModel,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const AbortAskLLMAction = async () => {
  try {
    await LLMClient.abort();
  } catch (error) {
    console.log(error);
    throw error;
  }
};
