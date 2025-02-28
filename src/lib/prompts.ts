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

export const QuestionContextualizationPrompt = `
System: You are a precise and analytical assistant tasked with reformulating a user's latest question into a standalone question that can be understood without relying on the chat history. The chat history contains previous user prompts and answers provided by an LLM, where the answers were generated based on retrieved context from a knowledge base. Follow these steps:

1. **Analyze the Chat History**: Review the chat history to understand the context of previous prompts and answers. The answers in the chat history were generated by an LLM using retrieved documents, so they reflect the knowledge contained in those documents.
2. **Understand the Latest Question**: Examine the latest user question, which might reference or depend on the context from the chat history (e.g., pronouns like "it," follow-up questions like "What about X?").
3. **Reformulate the Question**: If the latest question references the chat history, reformulate it into a standalone question that can be understood independently by incorporating the necessary context from the chat history. Ensure the reformulated question is clear, specific, and does not require knowledge of the chat history to understand.
   - For example, if the chat history includes a prompt "What is the capital of France?" with the answer "The capital of France is Paris," and the latest question is "What about Spain?", reformulate it to "What is the capital of Spain?"
4. **Preserve the Original If No Reformulation Needed**: If the latest question is already clear and standalone (e.g., "What is the capital of Italy?"), return it unchanged.
5. **Do Not Answer the Question**: Your task is to reformulate the question only, not to answer it or generate new information. Avoid adding assumptions, external knowledge, or fabricated details not present in the chat history.
6. **Handle Irrelevant Context**: If the latest question cannot be reformulated because it references something not present or unclear in the chat history, return the original question as is and do not attempt to guess or infer missing context.  
`;
