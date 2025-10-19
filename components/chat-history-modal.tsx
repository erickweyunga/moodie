"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { loadChat } from "@/utils/chat-store";
import { Message } from "@/db/schema";
import {
  Message as MessageComponent,
  MessageContent,
} from "@/components/ai-elements/message";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import { Loader } from "./ai-elements/loader";

interface ChatHistoryModalProps {
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistoryModal({
  chatId,
  isOpen,
  onClose,
}: ChatHistoryModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && chatId) {
      const loadMessages = async () => {
        try {
          setIsLoading(true);
          const chatMessages = await loadChat(chatId);
          setMessages(chatMessages);
        } catch (error) {
          console.error("Failed to load chat history:", error);
        } finally {
          setIsLoading(false);
        }
      };

      loadMessages();
    }
  }, [isOpen, chatId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full rounded-none max-h-full  md:!max-w-4xl md:max-h-[80vh] flex flex-col !p-3">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl">Chat History</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Loader className="h-4 w-4 animate-spin" />
              </div>
            </div>
          ) : messages.length > 0 ? (
            <div className="px-4">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <MessageComponent
                      from={message.role as "user" | "assistant"}
                    >
                      <MessageContent variant="contained">
                        <div className="text-sm prose prose-sm max-w-none">
                          <ReactMarkdown>{message.response}</ReactMarkdown>
                        </div>
                      </MessageContent>
                    </MessageComponent>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mb-2" />
              <p>No messages yet</p>
              <p className="text-sm">
                Start a conversation to see messages here
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
