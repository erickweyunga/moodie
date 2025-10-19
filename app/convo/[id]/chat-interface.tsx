"use client";

import { useState, createContext, useContext } from "react";
import { ChatHeader } from "@/components/chat/chat-header";
import { EmojiDisplay } from "@/components/chat/emoji-display";
import { MessageArea } from "@/components/chat/message-area";
import { ChatHistoryModal } from "@/components/chat-history-modal";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { chatMessageSchema } from "@/app/api/use-object/schema";

interface ChatInterfaceProps {
  chatId: string;
}

type ChatObjectContextType = {
  object: Record<string, unknown> | undefined;
  submit: (params: { id: string; prompt: string }) => void;
  isLoading: boolean;
  stop: () => void;
  latestMessage: Record<string, unknown> | undefined;
};

export const ChatObjectContext = createContext<ChatObjectContextType | null>(
  null,
);

export function useChatObject() {
  const context = useContext(ChatObjectContext);
  if (!context) {
    throw new Error("useChatObject must be used within a ChatObjectProvider");
  }
  return context;
}

export default function ChatInterface({ chatId }: ChatInterfaceProps) {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const { object, submit, isLoading, stop } = useObject({
    api: "/api/use-object",
    schema: chatMessageSchema,
  });

  const latestMessage = object?.messages?.[object.messages.length - 1];

  const chatObjectValue = {
    object,
    submit,
    isLoading,
    stop,
    latestMessage,
  };

  return (
    <ChatObjectContext.Provider value={chatObjectValue}>
      <div className="w-full max-w-2xl mx-auto p-2 gap-2 flex flex-col justify-between h-screen">
        <ChatHeader onOpenHistory={() => setIsHistoryModalOpen(true)} />

        <EmojiDisplay chatId={chatId} />

        <MessageArea chatId={chatId} />
      </div>

      <ChatHistoryModal
        chatId={chatId}
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />
    </ChatObjectContext.Provider>
  );
}
