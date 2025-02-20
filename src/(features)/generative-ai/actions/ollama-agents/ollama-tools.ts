import { SearchInFoodAndDrugAdministrationDatabase } from './fda-agent';
import { SearchInEuropeanMedicinesAgencyDatabase } from './ema-agent';
import { ExchangeRateTool } from './exchange-rate-agent';
export const AvailableTools = {
  SearchInFoodAndDrugAdministrationDatabase:
    SearchInFoodAndDrugAdministrationDatabase,
  SearchInEuropeanMedicinesAgencyDatabase:
    SearchInEuropeanMedicinesAgencyDatabase,
  ExchangeRateTool: ExchangeRateTool,
};
