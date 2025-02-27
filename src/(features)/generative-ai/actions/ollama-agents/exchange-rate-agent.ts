interface ExchangeRateParams {
  ThreeLetterCurrencyCode: string;
}

export const ExchangeRateTool = async (params: ExchangeRateParams) => {
  const url = 'https://open.er-api.com/v6/latest/USD';

  try {
    const response = await fetch(url);

    const data = await response.json();
    const rate = data.rates[params.ThreeLetterCurrencyCode];

    if (rate) {
      console.log(
        `Whooohooo The exchange rate of 1 USD to ${params.ThreeLetterCurrencyCode} is ${rate}`
      );
      return `As of today 1 USD is ${rate} ${params.ThreeLetterCurrencyCode}`;
    } else {
      return `No exchange rate found for ${params.ThreeLetterCurrencyCode}`;
    }
  } catch (error) {
    console.error('Unable to fetch exchange rate data:', error);
  }
};
