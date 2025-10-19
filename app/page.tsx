"use client";

import { useRouter } from "next/navigation";
import { createChat } from "@/utils/chat-store";
import { Button } from "@/components/ui/button";

export default function Convo() {
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const chatId = await createChat();

      router.push(`/convo/${chatId}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Conversation</h1>
        <Button onClick={handleNewChat}>Start New Chat</Button>
      </div>
    </div>
  );
}
