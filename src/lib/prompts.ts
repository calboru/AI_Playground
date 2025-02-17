export const EmbeddingPrompt = (markdownText: string, userPrompt: string) =>
  `Each data point title in the markdown text: '${markdownText}' is in bold. Modify the data points as per the instruction: '${userPrompt.trim()}'. Maintain the markdown format, ensuring data point titles remain in bold. If the instruction requests new data points, append them at the end in the same format. Do not add unspecified data points. Separate each data point with two spaces and a carriage return. Return only the modified markdown text without any elaboration. Call all available Ollama functions to assist you.`;
