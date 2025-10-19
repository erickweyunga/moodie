import { pgTable, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import {
  CallWarning,
  LanguageModelResponseMetadata,
  LanguageModelUsage,
  ProviderMetadata,
} from "ai";
import { createId } from "@paralleldrive/cuid2";

export const chats = pgTable(
  "chats",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("chats_created_at_idx").on(table.createdAt)],
);

export const messages = pgTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    chatId: text("chat_id")
      .references(() => chats.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),

    role: text("role").notNull().default("assistant"),
    face: text("face").notNull().default("😐"),
    response: text("response").notNull().default(""),

    usage: jsonb("usage").$type<LanguageModelUsage>(),
    responseMeta: jsonb("response_meta").$type<LanguageModelResponseMetadata>(),
    providerMetadata: jsonb("provider_metadata").$type<ProviderMetadata>(),
    error: jsonb("error"),
    warnings: jsonb("warnings").$type<CallWarning[]>(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_chat_idx").on(table.chatId),
    index("messages_created_at_idx").on(table.createdAt),
    index("messages_role_idx").on(table.role),
  ],
);

export const logs = pgTable(
  "logs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    level: text("level").notNull().default("info"),
    message: text("message").notNull(),
    meta: jsonb("meta").$type<LogMeta>().default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("logs_created_at_idx").on(table.createdAt),
    index("logs_level_idx").on(table.level),
  ],
);

export type Chat = typeof chats.$inferSelect; // Select type
export type NewChat = typeof chats.$inferInsert;

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

export type Log = typeof logs.$inferSelect;
export type NewLog = typeof logs.$inferInsert;
