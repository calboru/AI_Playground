// 'use server';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createToolCallingAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { ChatOllama } from '@langchain/ollama';
import { CurrencyConvertTool } from './currency-conversation-tool';

const BEST_TOOL_CALLING_LLM_NAME =
  process?.env?.BEST_TOOL_CALLING_LLM_NAME ?? 'llama3.2';

const llm = new ChatOllama({
  model: BEST_TOOL_CALLING_LLM_NAME,
  temperature: 0,
  maxRetries: 2,
  baseUrl: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});

const tools = [CurrencyConvertTool];
const toolSet = tools
  .map((t) => {
    return `ToolName:${t.name}, \n Tool Description:${t.description} `;
  })
  .join('\n');

const prompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `You are an intelligent agent designed to analyze retrieved context and execute actions using only the tools in the provided tool set: (${toolSet}), where each tool includes its name, description, and required parameters. Your task is to:  
1. Examine the retrieved context to identify patterns, entities, or values (e.g., foreign currencies and amounts) that could benefit from additional information provided by tools in the tool set.  
2. Match identified elements in the context (e.g., currency values like "100 USD" or "50 EUR") to applicable tools (e.g., a currency conversion tool) based on their descriptions and parameters in ${toolSet}.  
3. If the context is clear and aligns with one or more tools, invoke each relevant tool with the appropriate parameters extracted from the context. Do not use tools outside ${toolSet} or rely on training data.  
4. Process the tool outputs and return a concise, relevant response (e.g., converted currency values) based solely on the results.  
5. Ensure context-aware intent detection, invoking only tools that explicitly match the context and its values.  
6. If the context is unclear, lacks relevant values, or does not align with any tool in ${toolSet}, return an empty string ('') without explanation or additional content.
    `,
  ],
  ['placeholder', '{chat_history}'],
  ['human', 'retrieved context: "{input}"'],
  ['placeholder', '{agent_scratchpad}'],
]);

const agent = createToolCallingAgent({
  llm,
  tools,
  prompt,
});

const agentExecutor = new AgentExecutor({
  agent,
  tools,
});

export default agentExecutor;
