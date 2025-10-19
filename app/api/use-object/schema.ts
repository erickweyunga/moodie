import { z } from "zod";

export const chatMessageSchema = z.object({
  messages: z.array(
    z.object({
      face: z
        .string()
        .default("😐")
        .describe("Face emoji representing AI reaction"),
      response: z.string().describe("AI response text"),
    }),
  ),
});
