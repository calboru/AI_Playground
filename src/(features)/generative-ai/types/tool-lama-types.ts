import { z } from 'zod';
import { Document } from '@langchain/core/documents';
// Define the generic ToolCallSchema
export const ToolCallSchema = <T extends z.ZodTypeAny>(argsSchema: T) =>
  z.object({
    tool: z.string(),
    args: argsSchema,
  });

// Define an array schema for multiple tool calls
export const MultiToolCallSchema = <T extends z.ZodTypeAny>(argsSchema: T) =>
  z.array(ToolCallSchema(argsSchema));

// Define a fully generic Tool interface
export interface Tool<TInput> {
  name: string;
  description: string;
  invoke: (input: TInput) => Promise<Document<Record<string, unknown>>[]>;
  inputSchema: z.ZodType<TInput>;
}
