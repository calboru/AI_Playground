import { tool } from '@langchain/core/tools';
import { z } from 'zod';
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

export const CurrencyConvertTool = tool(
  async (input: CurrencyConversionInputType) => {
    const parsedInput = CurrencyConversionInputSchema.safeParse(input);
    if (!parsedInput.success) {
      const errorMessage = `Invalid input: ${parsedInput.error.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ')}`;
      console.error(errorMessage);
      console.log(input, errorMessage);
      return 'Invalid arguments for the CurrencyConversionTool';
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
        return result;
      } else {
        return `No exchange rate found for ${currencyFrom} to ${currencyTo}`;
      }
    } catch (error) {
      console.error('Unable to fetch exchange rate data:', error);
      throw error;
    }
  },

  {
    name: 'CurrencyConvertTool',
    description:
      'Converts an amount from one currency to another using the latest exchange rate. Accepts {{currencyFrom: string, currencyTo: string, amount?: string}} and returns the converted amount in a descriptive string.',
    schema: CurrencyConversionInputSchema,
  }
);
