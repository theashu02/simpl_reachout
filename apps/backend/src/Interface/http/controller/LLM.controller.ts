import { llm } from "../../../config/OpenAI/openai";
import { LLM_MODEL } from "../../../utils/config";

export const LLMController = {
  // Handler for sending messages
  sendMessage: async ({ body }: { body: { message: string } }) => {
    const { message } = body;

    if (!message) {
      return { success: false, error: "Message is required" };
    }

    try {
      console.log(`📩 Processing: ${message.substring(0, 50)}...`);

      const response = await llm.chat.completions.create({
        model: LLM_MODEL || "zai-org/glm-4.6v-flash",
        messages: [
          { role: "system", content: "You are a helpful AI assistant." },
          { role: "user", content: message },
        ],
        temperature: 0.7,
      });

      return {
        success: true,
        reply: response.choices[0].message.content,
      };
    } catch (error) {
      console.error("❌ LLM Error:", error);
      return {
        success: false,
        error: "Failed to connect to Local AI",
      };
    }
  },
};
