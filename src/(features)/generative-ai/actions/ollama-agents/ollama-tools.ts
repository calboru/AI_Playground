import { SearchInFoodAndDrugAdministrationDatabase } from './fda-agent';
import { SearchInEuropeanMedicinesAgencyDatabase } from './ema-agent';
import { CurrencyConverterTool } from './currency-converter-tool';
export const AvailableTools = {
  SearchInFoodAndDrugAdministrationDatabase:
    SearchInFoodAndDrugAdministrationDatabase,
  SearchInEuropeanMedicinesAgencyDatabase:
    SearchInEuropeanMedicinesAgencyDatabase,
  CurrencyConverterTool: CurrencyConverterTool,
};
