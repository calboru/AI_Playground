'use server';
import { LLMClient } from '@/clients/llm-client';

import { AbortableAsyncIterator, ChatResponse, Tool } from 'ollama';
import { AvailableTools } from './ollama-agents/ollama-tools';

export const AskLLMAction = async (
  defaultModel: string,
  prompt: string,
  tools: Tool[] = [],
  stream = true,
  returnOnlyToolResponses = false
): Promise<AbortableAsyncIterator<ChatResponse> | ChatResponse | string[]> => {
  try {
    const combinedMessages = [{ role: 'user', content: prompt }];
    console.log('AskLLMAction prompt:', prompt);

    const initialCall = await LLMClient.chat({
      model: defaultModel,
      messages: combinedMessages,
      stream: false,
      tools: tools,
    });

    let output = '';
    let toolResponses: string[] = [];
    if (initialCall.message.tool_calls) {
      toolResponses = [];

      for (const tool of initialCall.message.tool_calls) {
        const functionToCall = (
          AvailableTools as unknown as {
            [key: string]: (args: unknown) => Promise<string>;
          }
        )[tool.function.name];

        if (functionToCall) {
          console.log('Calling TOOL:', tool.function.name);
          console.log('TOOL Arguments:', tool.function.arguments);

          output = await functionToCall(tool.function.arguments);
          console.log('TOOL output:', output);

          combinedMessages.push(initialCall.message);
          combinedMessages.push({
            role: 'tool',
            content: output.toString(),
          });
          toolResponses.push(output.toString());
        } else {
          console.log('TOOL', tool.function.name, 'not found');
        }
      }
    } else {
      console.log('No function calls found in the response');
    }

    if (returnOnlyToolResponses) {
      return toolResponses;
    }

    if (stream) {
      return await LLMClient.chat({
        model: 'command-r7b',
        messages: combinedMessages,
        stream: true,
      });
    } else {
      return await LLMClient.chat({
        model: 'command-r7b',
        messages: combinedMessages,
        stream: false,
      });
    }
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
