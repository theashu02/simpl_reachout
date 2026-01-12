import { OpenAI } from "openai";
import { LLM_API_KEY, LLM_BASE_URL } from "../../utils/config";


export const llm = new OpenAI({
  baseURL: LLM_BASE_URL,
  apiKey: LLM_API_KEY
});