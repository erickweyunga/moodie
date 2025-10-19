import { TypedToolCall, TypedToolResult, tool } from "ai";
import { z } from "zod";
import { EMOJI_MAPPER } from "../emojis";

export const expressionTool = {
  expression: tool({
    description:
      "Use this tool to show an emotional expression or reaction that matches the tone and content of your message. Choose from available expressions like 'joy', 'smile', 'sad', 'angry', 'thinking-face', etc. to visually express your emotional state or reaction to the conversation.",
    inputSchema: z.object({
      expressionName: z
        .string()
        .describe(
          "Name of the expression from EMOJI_MAPPER that matches your emotional state or reaction",
        ),
    }),
    execute: async ({ expressionName }) => {
      const expression = EMOJI_MAPPER.find(
        (emoji) => emoji.name.toLowerCase() === expressionName.toLowerCase(),
      );

      if (!expression) {
        throw new Error(`Expression "${expressionName}" not found`);
      }

      return {
        expressionName: expression.name,
        emojiUrl: expression.emoji,
        message: `I'm expressing: ${expression.name}`,
      };
    },
  }),
};

export type ExpressionToolCall = TypedToolCall<typeof expressionTool>;
export type ExpressionToolResult = TypedToolResult<typeof expressionTool>;
