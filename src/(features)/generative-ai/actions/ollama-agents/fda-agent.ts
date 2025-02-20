import { LLMClient } from '@/clients/llm-client';

export const SearchInFoodAndDrugAdministrationDatabase = async (args: {
  drugOrCompoundNameOrQuestion: string;
}) => {
  //TODO: Find the best searchable fields or API end point then implement. Now it is just a placeholder
  try {
    const response = await LLMClient.chat({
      model: 'dolphin3:latest',
      messages: [{ role: 'user', content: args.drugOrCompoundNameOrQuestion }],
      stream: false,
    });
    return response.message.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
