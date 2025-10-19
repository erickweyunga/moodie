"use server";

import type {
  LanguageModelUsage,
  LanguageModelResponseMetadata,
  ProviderMetadata,
  CallWarning,
} from "ai";
import {
  createChat as createChatAction,
  saveMessage as saveMessageAction,
  loadChatMessages as loadChatMessagesAction,
  deleteChat as deleteChatAction,
  saveUserMessage as saveUserMessageAction,
} from "@/actions/chat";

export async function createChat(): Promise<string> {
  return await createChatAction();
}

export async function loadChat(chatId: string) {
  return await loadChatMessagesAction(chatId);
}

export async function saveChatMessages({
  chatId,
  messages,
}: {
  chatId: string;
  messages: {
    role?: "assistant" | "user" | "system";
    face?: string;
    response: string;
    usage?: LanguageModelUsage;
    responseMeta?: LanguageModelResponseMetadata;
    providerMetadata?: ProviderMetadata;
    error?: unknown;
    warnings?: CallWarning[];
  }[];
}) {
  for (const msg of messages) {
    await saveMessageAction({
      chatId,
      role: msg.role || "assistant",
      face: msg.face || "😐",
      response: msg.response,
      usage: msg.usage,
      responseMeta: msg.responseMeta,
      providerMetadata: msg.providerMetadata,
      error: msg.error,
      warnings: msg.warnings,
    });
  }
}

export async function saveUserMessage({
  chatId,
  response,
}: {
  chatId: string;
  response: string;
}) {
  await saveUserMessageAction({
    chatId,
    response,
  });
}

export async function deleteChat(chatId: string) {
  await deleteChatAction(chatId);
}
