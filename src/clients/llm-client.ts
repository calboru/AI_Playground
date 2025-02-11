import { Ollama } from 'ollama';

//OLLAMA DOES NOT WORK ON THE DOCKER CONTAINER IN MAC ENVIRONMENT DUE TO VIRTUALIZATION ISSUE
//USE 'http://host.docker.internal:11434' for MAC environment to access the Ollama server on the docker host.

export const LLMClient = new Ollama({
  host: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434',
});
