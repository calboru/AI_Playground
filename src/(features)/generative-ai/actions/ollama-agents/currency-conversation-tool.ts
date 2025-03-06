import { z } from 'zod';
import { Document } from '@langchain/core/documents';
import { Tool } from '../../types/tool-lama-types';

export const CurrencyConversionInputSchema = z.object({
  currencyFrom: z.string().trim().min(1, 'currencyFrom must not be empty'),
  currencyTo: z.string().trim().min(1, 'currencyTo must not be empty'),
  amount: z.preprocess(
    (val) => (val === undefined ? '1' : String(val)),
    z.string()
  ),
});

export type CurrencyConversionInputType = z.infer<
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
