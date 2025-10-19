ALTER TABLE "messages" ADD COLUMN "role" text DEFAULT 'assistant' NOT NULL;--> statement-breakpoint
CREATE INDEX "messages_role_idx" ON "messages" USING btree ("role");