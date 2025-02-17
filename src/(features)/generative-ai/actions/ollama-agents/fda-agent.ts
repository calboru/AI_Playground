//import { jsonToMarkdown } from '../convert-json-to-markdown';

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

export const SearchInFoodAndDrugAdministrationDatabaseAgent = {
  type: 'function',
  function: {
    name: 'SearchInFoodAndDrugAdministrationDatabase',
    description:
      'Search anything in U.S. Food and Drug Administration Database',
    parameters: {
      type: 'object',
      required: ['drugOrCompoundNameOrQuestion'],
      properties: {
        drugOrCompoundNameOrQuestion: {
          type: 'string',
          description: 'Name of the drug or compound or any question',
        },
      },
    },
  },
};
