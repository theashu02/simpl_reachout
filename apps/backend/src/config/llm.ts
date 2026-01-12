import { llm } from "./openai";
import { LLM_MODEL } from "../utils/config";

export const streamLLMResponse = async (prompt: string, onChunk: (chunk: string) => void) => {
  try {
    const stream = await llm.chat.completions.create({
      model: LLM_MODEL || "gpt-3.5-turbo", // Fallback if undefined
      messages: [{ role: "user", content: prompt }],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error("LLM Stream Error:", error);
    onChunk("\n[Error generating response]");
  }
};