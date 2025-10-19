"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { loadChat } from "@/utils/chat-store";
import { useChatObject } from "@/app/convo/[id]/chat-interface";

interface EmojiDisplayProps {
  chatId: string;
}

export function EmojiDisplay({ chatId }: EmojiDisplayProps) {
  const [lastStableEmoji, setLastStableEmoji] = useState("👋");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { latestMessage } = useChatObject();

  useEffect(() => {
    const loadInitialEmoji = async () => {
      try {
        const messages = await loadChat(chatId);
        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          if (lastMessage.role === "assistant") {
            setLastStableEmoji(lastMessage.face);
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadInitialEmoji();
  }, [chatId]);

  useEffect(() => {
    if (
      latestMessage?.face &&
      typeof latestMessage.face === "string" &&
      latestMessage.face !== lastStableEmoji
    ) {
      setLastStableEmoji(latestMessage.face);
    }
  }, [latestMessage?.face, lastStableEmoji]);

  const displayEmoji =
    latestMessage?.face && typeof latestMessage.face === "string"
      ? latestMessage.face
      : lastStableEmoji;

  return (
    <Card className="!p-0 flex-1 justify-center items-center !border-none bg-transparent shadow-none">
      <CardContent className="!p-0 flex flex-col items-center justify-center h-full">
        <p className="text-6xl md:text-9xl">{displayEmoji}</p>
        <div ref={messagesEndRef} />
      </CardContent>
    </Card>
  );
}
