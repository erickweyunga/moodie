import { Suspense } from "react";
import ChatInterface from "./chat-interface";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatInterface chatId={id} />
    </Suspense>
  );
}
