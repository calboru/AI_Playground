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

export const CurrencyConverterTool = {
  type: 'function',
  function: {
    name: 'CurrencyConverterTool',
    description:
      'Converts an amount between two currencies using the given three-letter currency codes.',
    parameters: {
      type: 'object',
      required: ['currencyFrom', 'currencyTo'],
      properties: {
        currencyFrom: {
          type: 'string',
          description:
            'Three letter ISO_4217 currency code of the source currency',
        },
        currencyTo: {
          type: 'string',
          description:
            'Three letter ISO_4217 currency code of the target currency',
        },
      },
    },
  },
};
