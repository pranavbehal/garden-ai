import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * POST request handler for chat interactions
 * @param {Request} req - Incoming request object containing messages and context
 * @returns {Response} Streamed AI response with formatted dialogue and metadata
 */
export async function POST(req: Request) {
  const { messages, systemMessage, plantImage, attachedImage } =
    await req.json();

  // Convert messages to include image URLs as attachments
  const processedMessages = messages.map((msg) => {
    if (msg.experimental_attachments?.length > 0) {
      return {
        ...msg,
        content: `${msg.content}\n[Attached Image: ${msg.experimental_attachments[0].url}]`,
      };
    }
    return msg;
  });

  const imageContext = plantImage
    ? `\n\nCurrent Plant Context: This conversation is about a plant shown in this image: ${plantImage}. Please reference this image when providing advice about the plant's condition and care.`
    : "";

  const enhancedSystem = `You are Garden AI, an expert gardening assistant with deep knowledge of plants, gardening techniques, and sustainable growing practices. ${systemMessage}${imageContext}

  Guidelines for responses:
  - BE CONCISE 
  - Provide specific, actionable advice
  - Include both immediate solutions and long-term best practices
  - Consider the plant's growth stage, season, and common issues
  - Reference sustainable and organic gardening methods when applicable
  - Keep explanations clear and accessible for beginners
  - When images are provided, analyze them for visual cues about plant health
`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: enhancedSystem,
    messages: processedMessages,
    temperature: 0.7,
    maxTokens: 500,
  });

  return result.toDataStreamResponse();
}
