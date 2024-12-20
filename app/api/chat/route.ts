/**
 * Chat API Route Handler
 *
 * Processes chat requests and generates AI responses using OpenAI's API.

 *
 * @route POST /api/chat
 */

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

/**
 * POST request handler for chat interactions
 * @param {Request} req - Incoming request object containing messages and context
 * @returns {Response} Streamed AI response with formatted dialogue and metadata
 */
export async function POST(req: Request) {
  const { messages, systemMessage } = await req.json();

  const enhancedSystem = `You are Garden AI, an expert gardening assistant with deep knowledge of plants, gardening techniques, and sustainable growing practices. ${systemMessage}

  Guidelines for responses:
  - BE CONCISE
  - Provide specific, actionable advice
  - Include both immediate solutions and long-term best practices
  - Consider the plant's growth stage, season, and common issues
  - Reference sustainable and organic gardening methods when applicable
  - Keep explanations clear and accessible for beginners
`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: enhancedSystem,
    messages,
    temperature: 0.7,
    // maxTokens: 500,
  });

  return result.toDataStreamResponse();
}
