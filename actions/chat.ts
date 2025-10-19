"use server";

import { db } from "@/db";
import { chats, messages } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type {
  LanguageModelUsage,
  LanguageModelResponseMetadata,
  ProviderMetadata,
  CallWarning,
} from "ai";

export async function createChat(): Promise<string> {
  const [chat] = await db.insert(chats).values({}).returning({ id: chats.id });
  return chat.id;
}

export async function loadChatMessages(chatId: string) {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt);
}

export async function saveMessage({
  chatId,
  role = "assistant",
  face,
  response,
  usage,
  responseMeta,
  providerMetadata,
  error,
  warnings,
}: {
  chatId: string;
  role?: "assistant" | "user" | "system";
  face: string;
  response: string;
  usage?: LanguageModelUsage;
  responseMeta?: LanguageModelResponseMetadata;
  providerMetadata?: ProviderMetadata;
  error?: unknown;
  warnings?: CallWarning[];
}) {
  await db.insert(messages).values({
    chatId,
    role,
    face,
    response,
    usage,
    responseMeta,
    providerMetadata,
    error,
    warnings,
  });
}

export async function saveChatMessages({
  chatId,
  messages: chatMessages,
}: {
  chatId: string;
  messages: Array<{
    role?: "assistant" | "user" | "system";
    face: string;
    response: string;
    usage?: LanguageModelUsage;
    error?: unknown;
    providerMetadata?: ProviderMetadata;
    responseMeta?: LanguageModelResponseMetadata;
    warnings?: CallWarning[];
  }>;
}) {
  for (const message of chatMessages) {
    await db.insert(messages).values({
      chatId,
      role: message.role || "assistant",
      face: message.face,
      response: message.response,
      usage: message.usage,
      responseMeta: message.responseMeta,
      providerMetadata: message.providerMetadata,
      error: message.error,
      warnings: message.warnings,
    });
  }
}

export async function deleteChat(chatId: string) {
  await db.delete(chats).where(eq(chats.id, chatId));
}

export async function listChats() {
  const allChats = await db.select().from(chats).orderBy(desc(chats.createdAt));
  return allChats;
}

export async function saveUserMessage({
  chatId,
  response,
}: {
  chatId: string;
  response: string;
}) {
  await db.insert(messages).values({
    chatId,
    role: "user",
    face: "🙂",
    response,
  });
}
