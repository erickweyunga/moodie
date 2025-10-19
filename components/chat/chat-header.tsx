"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode";

interface ChatHeaderProps {
  onOpenHistory: () => void;
}

export function ChatHeader({ onOpenHistory }: ChatHeaderProps) {
  return (
    <Card className="max-h-10 justify-center items-center border">
      <CardContent className="flex w-full items-center justify-between p-2">
        <div>
          <Button size={"icon-sm"} onClick={onOpenHistory} variant="outline">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>

        <ModeToggle />
      </CardContent>
    </Card>
  );
}
