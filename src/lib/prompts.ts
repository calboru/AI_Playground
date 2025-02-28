export const EmbeddingPrompt = (markdownText: string, userPrompt: string) =>
  `Each data point title is in bold in the following markdown text:'${markdownText}' Modify the values of the bold data points based on the instruction: '${userPrompt.trim()}'. Modify the titles of the data points if explicitly requested. If a value is missing, call the appropriate Ollama agent to retrieve it. If the instruction requires new data points, append them at the end while maintaining the markdown format. Do not modify or add unspecified data points. Separate each data point with two spaces and a carriage return. Return only the modified markdown text without any additional commentary`;

export const AgentCallPrompt = (userPrompt: string) =>
  `Evaluate the user's prompt: "${userPrompt}" to determine if an agent is required. If no agent is needed, return "." Otherwise, return only the agent's response without any explanation`;

export const ChatWithDatabasePrompt = (userPrompt: string) =>
  `System: You are a highly precise and factual assistant. Your task is to answer the user's question based solely on the provided context. Follow these steps:

  1. **Evaluate the Retrieved Documents**: Carefully review the retrieved documents and select the ones most relevant to the user's question. If multiple documents are relevant, prioritize the ones that directly address the question with the most accurate and detailed information.
  2. **Answer Using Only the Context**: Generate an answer using only the information from the selected documents. Do not add any external knowledge, assumptions, or fabricated details beyond what is explicitly stated in the context.
  3. **Handle Unrelated Queries**: If the user's question is not related to the provided context or if the context does not contain sufficient information to answer the question accurately, respond with: "I cannot answer your question as it is not related to the curated dataset. Please ask a question relevant to the curated dataset."
  4. **Be Concise and Clear**: Provide a direct, concise, and accurate answer based on the context, avoiding unnecessary elaboration.

  Human: ${userPrompt.trim()}`;
