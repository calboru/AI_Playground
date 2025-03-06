import { BaseWebSearchToolWithAI } from './web-search-tool';
import { RunnableLambda, RunnableSequence } from '@langchain/core/runnables';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOllama } from '@langchain/ollama';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

// Environment variables
const RAG_LLM_MODEL_NAME = process.env.RAG_LLM_MODEL_NAME ?? 'dolphin3';
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';

// Initialize LLM
const llm = new ChatOllama({
  model: RAG_LLM_MODEL_NAME,
  temperature: 0,
  maxRetries: 2,
  baseUrl: OLLAMA_URL,
});

// Prompt for modifying markdown
const markdownModificationPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `
    You are an expert at modifying markdown text based on instructions. The provided markdown text contains data points with titles in **bold** followed by their values, separated by two spaces and a newline (\\n). Follow these rules:
    1. Start with the original markdown text exactly as provided.
    2. Update the values of existing **bold** data point titles only if the instruction explicitly requests it.
    3. Modify the titles of existing data points only if the instruction explicitly requests a title change.
    4. If the instruction requests new data points, create them using information from the provided search results and append them at the end of the original markdown text. Format each new data point as **title**: value.
    5. Do not modify or add data points unless explicitly instructed. Do not invent data not present in the instruction or search results.
    6. Ensure all data points (original and new) are separated by two spaces and a newline (\\n).
    7. Return the complete modified markdown text, including all original data points plus any new ones appended, with no additional commentary or explanations.

    Example:
    "**first_name**: John  \n"
    "**last_name**: Doe  \n"
    "**age**: 30  \n"
    "**new_data_point**: new_value  \n"
    `,
  ],
  ['user', '{usersPrompt}'],
  ['user', '{markdownText}'],
  ['user', '{searchResult}'],
]);
// Initial prompt template for generating the search phrase
const searchPhraseGenerationPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Based on the user’s prompt and provided markdown text, generate a concise, search engine-friendly question or phrase. 
    Return only the generated query in the format: [search:question or search phrase], with no additional text or explanations.`,
  ],
  ['user', '{usersPrompt}'],
  ['user', '{markdownText}'],
]);

const searchPhraseRefinementPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an expert at extracting search phrases or questions from text. Given the provided text, identify and extract only the search phrase or question. If the text contains a pattern like '[search: ...]', extract the content within it, removing the '[search:' prefix and ']' suffix. Return only the extracted phrase or question as plain text, without brackets, markdown, additional explanations, or any other text.`,
  ],
  ['user', '{providedText}'],
]);

const chain = RunnableSequence.from([
  // Step 1: Generate search phrase
  RunnableLambda.from(
    async (input: { markdownText: string; usersPrompt: string }) => {
      const response = await searchPhraseGenerationPrompt.pipe(llm).invoke({
        markdownText: input.markdownText,
        usersPrompt: input.usersPrompt,
      });
      console.log('CURATION STEP-1', input);
      return {
        markdownText: input.markdownText,
        usersPrompt: input.usersPrompt,
        unrefinedSearchPhrase: response.content,
      };
    }
  ),

  // Step 2: Refine search phrase
  RunnableLambda.from(
    async (input: {
      markdownText: string;
      usersPrompt: string;
      unrefinedSearchPhrase: string;
    }) => {
      console.log('CURATION STEP-2', input);

      const response = await searchPhraseRefinementPrompt.pipe(llm).invoke({
        providedText: input.unrefinedSearchPhrase,
      });

      return {
        markdownText: input.markdownText,
        usersPrompt: input.usersPrompt,
        searchPhrase: response.content,
      };
    }
  ),
  //Step 3: perform web search
  RunnableLambda.from(
    async (input: {
      searchPhrase: string;
      markdownText: string;
      usersPrompt: string;
    }) => {
      console.log('CURATION STEP-3', input);

      const response = await BaseWebSearchToolWithAI(input.searchPhrase);

      return {
        searchResult: response.answer,
        markdownText: input.markdownText,
        usersPrompt: input.usersPrompt,
      };
    }
  ),
  // Step 4: Modify markdown
  RunnableLambda.from(
    async (input: {
      searchResult: string;
      markdownText: string;
      usersPrompt: string;
    }) => {
      const response = await markdownModificationPrompt.pipe(llm).invoke({
        usersPrompt: input.usersPrompt,
        markdownText: input.markdownText,
        searchResult: input.searchResult,
      });
      console.log('CURATION STEP-4', {
        ...input,
        updatedMarkdownText: response.content,
      });

      return { updatedMarkdownText: response.content }; // Pass it to the next step
    }
  ),
]);

const curatorToolSchema = z.object({
  operation: z
    .enum(['search', 'webSearch', 'find'])
    .describe('The type of operation to execute.'),
  markdownText: z.string().describe('User provided markdown text.'),
  usersPrompt: z
    .string()
    .describe(`User's prompt or instructions for the tool.`),
});

export const CurationTool = tool(
  async ({ markdownText, usersPrompt }) => {
    const res = await chain.invoke({
      markdownText,
      usersPrompt,
    });

    return res;
  },
  {
    name: 'CurationTool',
    description: '',
    schema: curatorToolSchema,
  }
);
