"use server";

import { db } from "@/db";
import { logs } from "@/db/schema";

export type LogLevel = "info" | "warn" | "error";

export interface SaveLogParams {
  level?: LogLevel;
  message: string;
  meta?: LogMeta;
  source?: string;
}

export async function saveLog({
  level = "info",
  message,
  meta = {},
  source,
}: SaveLogParams) {
  try {
    const metaWithSource = source ? { ...meta, source } : meta;

    await db.insert(logs).values({
      level,
      message,
      meta: metaWithSource,
    });
  } catch (err) {
    console.error("Failed to save log:", err);
  }
}
