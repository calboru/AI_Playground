import { ChatOllama } from '@langchain/ollama';
import { Tool, ToolRunnableConfig } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager';

// Define the Zod schema for input validation
const CurrencyConversionInputSchema = z.object({
  currencyFrom: z.string().trim().min(1, 'currencyFrom must not be empty'),
  currencyTo: z.string().trim().min(1, 'currencyTo must not be empty'),
  amount: z.string().optional().default('1'),
});

type CurrencyConversionInputType = z.infer<
  typeof CurrencyConversionInputSchema
>;

// Define the tool class
export class CurrencyConversionTool extends Tool {
  protected _call(): Promise<unknown> {
    return Promise.resolve();
  }
  public name = 'CurrencyConversionTool';
  public description =
    'Converts an amount from one currency to another using the latest exchange rate. Expects {{currencyFrom: string, currencyTo: string, amount?: string}}';

  private llm: ChatOllama;

  constructor(llm: ChatOllama) {
    super();
    this.llm = llm;
  }

  public async invoke(input: CurrencyConversionInputType): Promise<string> {
    const parsedInput = CurrencyConversionInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const errorMessage = `Invalid input: ${parsedInput.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`;
      console.error(errorMessage);
      return 'Invalid arguments for the CurrencyConversionTool';
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
        return result;
      } else {
        return `No exchange rate found for ${currencyFrom} to ${currencyTo}`;
      }
    } catch (error) {
      console.error('Unable to fetch exchange rate data:', error);
      throw error;
    }
  }

  public inputSchema: z.ZodSchema = CurrencyConversionInputSchema;
}

// Initialize LLM
const llm = new ChatOllama({
  model: 'llama3.2',
  temperature: 0,
  maxRetries: 2,
  baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});

// Create the tool instance
const currencyTool = new CurrencyConversionTool(llm);
const tools = [currencyTool];

// Define a custom agent-like executor
class CustomAgentExecutor {
  private llm: ChatOllama;
  private tools: Tool[];
  private prompt: ChatPromptTemplate;

  constructor(llm: ChatOllama, tools: Tool[]) {
    this.llm = llm;
    this.tools = tools;
    this.prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `You are a helpful assistant with access to tools. For tool calls, use this exact format:
        [ToolName]({{ "arg1": "value1", "arg2": "value2" }})
        Example: [CurrencyConversionTool]({{ "currencyFrom": "USD", "currencyTo": "EUR", "amount": "100" }})
        If no tool is needed, respond directly with your answer.
        Available tools: ${tools
          .map((t) => `${t.name} - ${t.description}`)
          .join(', ')}`,
      ],
      ['human', '{input}'],
    ]);
  }

  async invoke({ input }: { input: string }): Promise<{ output: string }> {
    console.log('Agent invoked with input:', input);

    // Format the prompt with the input
    const messages = await this.prompt.formatMessages({ input });

    // Invoke the LLM with the formatted messages
    const res = await this.llm.invoke(messages);
    const content = res.content.toString();
    console.log('LLM response:', content);

    // Parse potential tool call
    const toolCallMatch = content.match(/\[(\w+)\]\((.*?)\)/);
    if (toolCallMatch) {
      const [, toolName, argsStr] = toolCallMatch;
      const tool = this.tools.find((t) => t.name === toolName);

      if (tool) {
        try {
          const args = JSON.parse(argsStr);
          const toolResult = await tool.invoke(args);
          return { output: toolResult };
        } catch (error) {
          console.error(`Failed to execute tool ${toolName}:`, error);
        }
      }
    }

    // No tool call, return LLM response
    return { output: content };
  }
}

// Create the custom executor
export const agentExecutor = new CustomAgentExecutor(llm, tools);

// Export the bound LLM with tools (optional)
export const ToolLama = llm.bindTools(tools);

// Run the agent
(async () => {
  try {
    console.log('HELLO WORLD');
    const res = await agentExecutor.invoke({ input: 'Convert 100 USD to EUR' });
    console.log('Agent Response:', res.output);
  } catch (error) {
    console.error('Execution Error:', error);
  }
})();
