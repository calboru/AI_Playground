//import { jsonToMarkdown } from '../convert-json-to-markdown';

import { LLMClient } from '@/clients/llm-client';

export const SearchInEuropeanMedicinesAgencyDatabase = async (args: {
  promptOrQuestion: string;
}) => {
  //TODO: CALL EMA API OR IMPLEMENT THE SEARCH FUNCTIONALITY
  try {
    const response = await LLMClient.chat({
      model: 'dolphin3:latest',
      messages: [{ role: 'user', content: args.promptOrQuestion }],
      stream: false,
    });
    return response.message.content;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const SearchInEuropeanMedicinesAgencyDatabaseAgent = {
  type: 'function',
  function: {
    name: 'SearchInEuropeanMedicinesAgencyDatabase',
    description: 'Search anything in European Medicines Agency Database',
    parameters: {
      type: 'object',
      required: ['promptOrQuestion'],
      properties: {
        promptOrQuestion: {
          type: 'string',
          description: 'prompt or question',
        },
      },
    },
  },
};
