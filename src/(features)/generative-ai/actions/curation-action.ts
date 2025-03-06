'use server';

import { CurationTool } from './ollama-agents/curation-tool';

export const CurationAction = async (
  markdownText: string,
  usersPrompt: string
) => {
  const { updatedMarkdownText } = await CurationTool.invoke({
    operation: 'search',
    markdownText,
    usersPrompt,
  });

  return updatedMarkdownText;
};
