import ollama from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Document } from '@langchain/core/documents';
import { DynamicToolInvocationPrompt } from '@/lib/prompts';
import {
  MultiToolCallSchema,
  Tool,
  ToolCallSchema,
} from '../../types/tool-lama-types';
import {
  CurrencyConversionInputSchema,
  CurrencyConversionInputType,
  CurrencyConversionTool,
} from './currency-conversation-tool';

const BEST_TOOL_CALLING_LLM_NAME =
  process?.env?.BEST_TOOL_CALLING_LLM_NAME ?? 'llama3.2';

// Define the Zod schema for CurrencyConversionTool input

// Create tool instance
const currencyTool = new CurrencyConversionTool();

// Define a type for all known tools (currently just one)
type KnownTools = CurrencyConversionTool;
const tools: KnownTools[] = [currencyTool];

// Define a union type for all possible TInput types (currently just CurrencyConversionInputType)
type KnownToolInputs = CurrencyConversionInputType;

// Define a custom agent-like executor with proper generics
class CustomAgentExecutor<T extends Tool<KnownToolInputs>> {
  private tools: T[];

  constructor(tools: T[]) {
    this.tools = tools;
  }

  async invoke({
    input,
  }: {
    input: string;
  }): Promise<Document<Record<string, unknown>>[]> {
    console.log('Agent invoked with input:', input);
    const toolResponseDocuments: Document<Record<string, unknown>>[] = [];
    const listOfToolsString = this.tools
      .map((t) => `${t.name} - ${t.description}`)
      .join('\n\n  ');
    const dynamicToolInvokingPrompt =
      DynamicToolInvocationPrompt(listOfToolsString);

    // Dynamically generate the schema based on available tools
    const toolSchemas: Record<string, z.ZodType<KnownToolInputs>> = {};
    this.tools.forEach((tool) => {
      toolSchemas[tool.name] = tool.inputSchema as z.ZodType<KnownToolInputs>;
    });

    // Use an array schema with the union of known input types
    const response = await ollama.chat({
      model: BEST_TOOL_CALLING_LLM_NAME,
      messages: [
        {
          role: 'system',
          content: dynamicToolInvokingPrompt,
        },
        { role: 'user', content: input },
      ],
      format: zodToJsonSchema(
        MultiToolCallSchema(CurrencyConversionInputSchema)
      ),
    });

    const content = response.message.content;

    // Parse the response as an array of tool calls with the specific schema
    const toolCalls = MultiToolCallSchema(CurrencyConversionInputSchema).parse(
      JSON.parse(content)
    );
    if (toolCalls.length > 0 && toolCalls[0].tool !== null) {
      for (const toolCall of toolCalls) {
        const tool = this.tools.find((t) => t.name === toolCall.tool);
        if (tool) {
          const specificToolCall = ToolCallSchema(tool.inputSchema).parse(
            toolCall
          );
          const toolResults = await tool.invoke(
            specificToolCall.args as KnownToolInputs
          );
          toolResponseDocuments.push(...toolResults);
        }
      }
      console.log('Tool responses:', toolResponseDocuments);
      return toolResponseDocuments;
    }

    // Fallback parsing for CurrencyConversionTool
    const currencyMatch = input.match(
      /Convert\s+(\d+\.?\d*)\s+([A-Z]{3})\s+to\s+([A-Z]{3})/i
    );
    if (currencyMatch) {
      const [, amount, currencyFrom, currencyTo] = currencyMatch;
      const fallbackArgs = { currencyFrom, currencyTo, amount };
      const toolResult = await currencyTool.invoke(fallbackArgs);
      return toolResult;
    }

    return [];
  }
}

// Create the custom executor with specific type
export const agentExecutor = new CustomAgentExecutor<KnownTools>(tools);

// Verify the agent functionality
// (async () => {
//   try {
//     console.log('=== VERIFICATION START ===');

//     // Test CurrencyConversionTool
//     console.log('Testing CurrencyConversionTool...');
//     const res1 = await agentExecutor.invoke({
//       input: 'Lebrikizumab: 36812.20 DKK to USD',
//     });
//     console.log('Response 1:', res1);

//     console.log('=== VERIFICATION END ===');
//   } catch (error) {
//     console.error('Execution Error:', error);
//   }
// })();
