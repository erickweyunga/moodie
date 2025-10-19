"use client";

import { useState, useRef, useEffect } from "react";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputActionAddAttachments,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputSpeechButton,
  PromptInputSubmit,
  type PromptInputMessage,
} from "@/components/ai-elements/prompt-input";
import { Loader } from "@/components/ai-elements/loader";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { loadChat } from "@/utils/chat-store";
import { Message } from "@/db/schema";
import {
  Message as MessageComponent,
  MessageContent,
} from "@/components/ai-elements/message";
import { motion, AnimatePresence } from "motion/react";
import { useChatObject } from "@/app/convo/[id]/chat-interface";

const SUBMITTING_TIMEOUT = 200;
const STREAMING_TIMEOUT = 2000;

interface MessageAreaProps {
  chatId: string;
}

export function MessageArea({ chatId }: MessageAreaProps) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<
    "submitted" | "streaming" | "ready" | "error"
  >("ready");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const accumulatedResponseRef = useRef("");

  const { submit, isLoading, stop, latestMessage } = useChatObject();

  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoadingHistory(true);
        const messages = await loadChat(chatId);

        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          setCurrentMessage(lastMessage);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadChatHistory();
  }, [chatId]);

  // Handle streaming chunks in real-time
  useEffect(() => {
    if (latestMessage?.response && typeof latestMessage.response === "string") {
      const newChunk = latestMessage.response;

      if (!accumulatedResponseRef.current.includes(newChunk)) {
        accumulatedResponseRef.current = newChunk;

        setCurrentMessage((prev) => {
          if (!prev || prev.role === "user") {
            return {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              face:
                typeof latestMessage.face === "string"
                  ? latestMessage.face
                  : "😐",
              response: newChunk,
              createdAt: new Date(),
              chatId,
              error: null,
              usage: null,
              responseMeta: null,
              providerMetadata: null,
              warnings: null,
            };
          } else {
            return {
              ...prev,
              response: newChunk,
              face:
                typeof latestMessage.face === "string"
                  ? latestMessage.face
                  : prev.face,
            };
          }
        });
      }
    }
  }, [latestMessage?.response, latestMessage?.face, chatId]);

  // Reset accumulated response when starting new submission
  useEffect(() => {
    if (status === "submitted") {
      accumulatedResponseRef.current = "";
    }
  }, [status]);

  // Update status to streaming when loading
  useEffect(() => {
    if (isLoading && status !== "streaming") {
      setStatus("streaming");
    } else if (!isLoading && status === "streaming") {
      setStatus("ready");
    }
  }, [isLoading, status]);

  const onStop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setStatus("ready");
    stop();
  };

  const handleSubmit = (message: PromptInputMessage) => {
    if (status === "streaming" || status === "submitted") {
      onStop();
      return;
    }

    if (!message.text) return;

    setStatus("submitted");
    setTimeout(() => setStatus("streaming"), SUBMITTING_TIMEOUT);

    timeoutRef.current = setTimeout(() => {
      setStatus("ready");
      timeoutRef.current = null;
    }, STREAMING_TIMEOUT);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      face: "🙂",
      response: message.text,
      createdAt: new Date(),
      chatId,
      error: null,
      usage: null,
      responseMeta: null,
      providerMetadata: null,
      warnings: null,
    };

    setCurrentMessage(userMessage);
    accumulatedResponseRef.current = "";

    submit({ id: chatId, prompt: message.text });
    setText("");
  };

  const hasMessage = !!currentMessage;
  const showInitialWelcome = !hasMessage && !isLoading && !isLoadingHistory;

  return (
    <Card className="!p-0">
      <CardContent className="p-2 rounded">
        <div className="relative max-h-100 min-h-5 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentMessage ? (
              <motion.div
                key={currentMessage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MessageComponent
                  from={currentMessage.role as "user" | "assistant"}
                >
                  <MessageContent variant="contained">
                    <div className="text-sm opacity-80 prose prose-sm max-w-none">
                      <ReactMarkdown>{currentMessage.response}</ReactMarkdown>
                      {isLoading && currentMessage.role === "assistant" && (
                        <div className="flex w-full justify-end mt-1">
                          <Loader size={12} />
                        </div>
                      )}
                    </div>
                  </MessageContent>
                </MessageComponent>
              </motion.div>
            ) : showInitialWelcome ? (
              <div className="flex items-center p-1">
                <div className="flex-1 text-sm opacity-55 prose prose-sm max-w-none">
                  Start a conversation by typing a message below.
                </div>
              </div>
            ) : (
              isLoadingHistory && (
                <div className="flex items-center justify-center h-32">
                  <Loader size={20} />
                </div>
              )
            )}
          </AnimatePresence>
        </div>

        <div className="mt-1">
          <PromptInput
            onSubmit={handleSubmit}
            className="relative"
            maxFiles={1}
            maxFileSize={2}
            autoFocus
            spellCheck
          >
            <PromptInputBody>
              <PromptInputAttachments>
                {(attachment) => <PromptInputAttachment data={attachment} />}
              </PromptInputAttachments>
              <PromptInputTextarea
                onChange={(e) => setText(e.target.value)}
                ref={textareaRef}
                value={text}
                placeholder="Type your message..."
              />
            </PromptInputBody>

            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>

                <PromptInputSpeechButton
                  onTranscriptionChange={setText}
                  textareaRef={textareaRef}
                />
              </PromptInputTools>

              <PromptInputSubmit status={isLoading ? "streaming" : status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </CardContent>
    </Card>
  );
}
