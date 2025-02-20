export const EmbeddingPrompt = (markdownText: string, userPrompt: string) =>
  `Each data point title is in bold in the following markdown text:'${markdownText}' Modify the values of the bold data points based on the instruction: '${userPrompt.trim()}'. Modify the titles of the data points if explicitly requested. If a value is missing, call the appropriate Ollama agent to retrieve it. If the instruction requires new data points, append them at the end while maintaining the markdown format. Do not modify or add unspecified data points. Separate each data point with two spaces and a carriage return. Return only the modified markdown text without any additional commentary`;

export const AgentCallPrompt = (userPrompt: string) =>
  `Evaluate the user's prompt: "${userPrompt}" to determine if a tool is required. If no tool is needed, return "." Otherwise, return only the tool's response without any explanation`;
