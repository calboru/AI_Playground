interface CurrencyCodeParams {
  currencyFrom: string;
  currencyTo: string;
}

export const CurrencyConverterTool = async (params: CurrencyCodeParams) => {
  if (params?.currencyFrom?.length !== 3 || params?.currencyTo?.length !== 3) {
    return `Currency codes must be three`;
  }

  const url = `https://hexarate.paikama.co/api/rates/latest/${params?.currencyFrom?.trim()}?target=${params?.currencyTo?.trim()}`;

  try {
    const response = await fetch(url);

    const data = await response.json();
    const rate = +data?.data?.mid;

    if (rate > 0) {
      console.log(
        `As of today 1 ${params?.currencyFrom} is ${rate} ${params?.currencyTo}`
      );
      return `As of today 1 ${params?.currencyFrom} is ${rate} ${params?.currencyTo}`;
    } else {
      return `No exchange rate found for ${params?.currencyFrom} to ${params?.currencyTo}`;
    }
  } catch (error) {
    console.error('Unable to fetch exchange rate data:', error);
  }
};
