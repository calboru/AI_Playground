'use server';
import { LLMClient } from '@/clients/llm-client';
import {
  SearchInFoodAndDrugAdministrationDatabase,
  SearchInFoodAndDrugAdministrationDatabaseAgent,
} from './ollama-agents/fda-agent';
import {
  SearchInEuropeanMedicinesAgencyDatabase,
  SearchInEuropeanMedicinesAgencyDatabaseAgent,
} from './ollama-agents/ema-agent';

const availableAgents = {
  SearchInFoodAndDrugAdministrationDatabase:
    SearchInFoodAndDrugAdministrationDatabase,
  SearchInEuropeanMedicinesAgencyDatabase:
    SearchInEuropeanMedicinesAgencyDatabase,
};

export const AskLLMAction = async (defaultModel: string, prompt: string) => {
  try {
    const combinedMessages = [{ role: 'user', content: prompt }];
    console.log('AskLLMAction prompt:', prompt);

    const initialCall = await LLMClient.chat({
      model: defaultModel,
      messages: combinedMessages,
      stream: false,
      tools: [
        SearchInFoodAndDrugAdministrationDatabaseAgent,
        SearchInEuropeanMedicinesAgencyDatabaseAgent,
      ],
    });

    let output = '';

    if (initialCall.message.tool_calls) {
      for (const tool of initialCall.message.tool_calls) {
        const functionToCall = (
          availableAgents as unknown as {
            [key: string]: (args: unknown) => Promise<string>;
          }
        )[tool.function.name];

        if (functionToCall) {
          console.log('Calling function:', tool.function.name);
          console.log('Arguments:', tool.function.arguments);

          output = await functionToCall(tool.function.arguments);
          console.log('Function output:', output);

          combinedMessages.push(initialCall.message);
          combinedMessages.push({
            role: 'tool',
            content: output.toString(),
          });
        } else {
          console.log('Function', tool.function.name, 'not found');
        }
      }
    } else {
      console.log('No function calls found in the response');
    }

    return await LLMClient.chat({
      model: 'command-r7b',
      messages: combinedMessages,
      stream: true,
    });
  } catch (error) {
    console.error('AskLLMAction error:', error);
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
