import ollama from 'ollama';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { Document } from '@langchain/core/documents';
import { DynamicToolInvocationPrompt } from '@/lib/prompts';

const BEST_TOOL_CALLING_LLM_NAME =
  process?.env?.BEST_TOOL_CALLING_LLM_NAME ?? 'llama3.2';

// Define the generic ToolCallSchema
const ToolCallSchema = <T extends z.ZodTypeAny>(argsSchema: T) =>
  z.object({
    tool: z.string(),
    args: argsSchema,
  });

// Define an array schema for multiple tool calls
const MultiToolCallSchema = <T extends z.ZodTypeAny>(argsSchema: T) =>
  z.array(ToolCallSchema(argsSchema));

// Define a fully generic Tool interface
interface Tool<TInput> {
  name: string;
  description: string;
  invoke: (input: TInput) => Promise<Document<Record<string, unknown>>[]>;
  inputSchema: z.ZodType<TInput>;
}

// Define the Zod schema for CurrencyConversionTool input
const CurrencyConversionInputSchema = z.object({
  currencyFrom: z.string().trim().min(1, 'currencyFrom must not be empty'),
  currencyTo: z.string().trim().min(1, 'currencyTo must not be empty'),
  amount: z.preprocess(
    (val) => (val === undefined ? '1' : String(val)),
    z.string()
  ),
});

type CurrencyConversionInputType = z.infer<
  typeof CurrencyConversionInputSchema
>;

// Define the CurrencyConversionTool class
export class CurrencyConversionTool
  implements Tool<CurrencyConversionInputType>
{
  public name = 'CurrencyConversionTool';
  public description =
    'Converts an amount from one currency to another using the latest exchange rate. Expects {{currencyFrom: string, currencyTo: string, amount?: string}}';
  public inputSchema: z.ZodType<CurrencyConversionInputType> =
    CurrencyConversionInputSchema as z.ZodType<CurrencyConversionInputType>;

  async invoke(
    input: CurrencyConversionInputType
  ): Promise<Document<Record<string, unknown>>[]> {
    const parsedInput = this.inputSchema.safeParse(input);
    if (!parsedInput.success) {
      const errorMessage = `Invalid input: ${parsedInput.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`;
      console.error(errorMessage);
      return [
        {
          pageContent: 'Invalid arguments for the CurrencyConversionTool',
          metadata: { source: `Ollama Agent: ${this.name}` },
        },
      ];
    }

    const { currencyFrom, currencyTo, amount } = parsedInput.data;
    const url = `https://hexarate.paikama.co/api/rates/latest/${currencyFrom}?target=${currencyTo}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const rate = +data?.data?.mid;
      const amountNum = parseFloat(amount);

      if (rate > 0) {
        const result = `${amountNum} ${currencyFrom} converts to ${(
          amountNum * rate
        ).toFixed(2)} ${currencyTo} as of today`;
        console.log(result);
        return [
          {
            pageContent: result,
            metadata: { source: `Ollama Agent: ${this.name}` },
          },
        ];
      } else {
        return [
          {
            pageContent: `No exchange rate found for ${currencyFrom} to ${currencyTo}`,
            metadata: { source: `Ollama Agent: ${this.name}` },
          },
        ];
      }
    } catch (error) {
      console.error('Unable to fetch exchange rate data:', error);
      throw error;
    }
  }
}

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
