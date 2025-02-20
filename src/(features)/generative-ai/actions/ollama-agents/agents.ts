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

export const SearchInFoodAndDrugAdministrationDatabaseAgent = {
  type: 'function',
  function: {
    name: 'SearchInFoodAndDrugAdministrationDatabase',
    description:
      'Search anything in U.S. Food and Drug Administration Database',
    parameters: {
      type: 'object',
      required: ['drugOrCompoundNameOrQuestion'],
      properties: {
        drugOrCompoundNameOrQuestion: {
          type: 'string',
          description: 'Name of the drug or compound or any question',
        },
      },
    },
  },
};

export const ExchangeRateAgent = {
  type: 'function',
  function: {
    name: 'ExchangeRateTool',
    description: 'Returns the rate of the given three letter currency code',
    parameters: {
      type: 'object',
      required: ['ThreeLetterCurrencyCode'],
      properties: {
        ThreeLetterCurrencyCode: {
          type: 'string',
          description: 'Three letter currency code',
        },
      },
    },
  },
};
