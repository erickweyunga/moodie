import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { chatMessageSchema } from "./schema";
import { saveChatMessages, saveUserMessage } from "@/utils/chat-store";
import { saveLog } from "@/actions/logs";
import {
  CHAT_SCHEMA_DESCRIPTION,
  CHAT_SCHEMA_NAME,
  SYSTEM_PROMPT,
} from "@/prompts/system";
import { loadChatMessages } from "@/actions/chat";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { id, prompt } = await req.json();

  await saveUserMessage({
    chatId: id,
    response: prompt,
  });

  const previousMessages = await loadChatMessages(id);

  const messageHistory = previousMessages.map((msg) => ({
    role: msg.role as "system" | "user" | "assistant",
    content: msg.response,
  }));

  const result = streamObject({
    model: google("gemini-2.0-flash-lite"),
    schema: chatMessageSchema,
    schemaName: CHAT_SCHEMA_NAME,
    schemaDescription: CHAT_SCHEMA_DESCRIPTION,
    messages: [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...messageHistory,
      {
        role: "user",
        content: prompt,
      },
    ],
    onError: async ({ error }) => {
      await saveLog({
        message: JSON.stringify(error),
        level: "error",
        source: "use-object",
      });
    },
    onFinish: async (data) => {
      if (!data.object?.messages) return;

      for (const chunk of data.object.messages) {
        await saveChatMessages({
          chatId: id,
          messages: [
            {
              role: "assistant",
              face: chunk.face,
              response: chunk.response,
              usage: data.usage,
              error: data.error,
              providerMetadata: data.providerMetadata,
              responseMeta: data.response,
              warnings: data.warnings,
            },
          ],
        });
      }
    },
  });

  return result.toTextStreamResponse();
}
