ALTER TABLE "site_settings" ADD COLUMN "blog_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "vision_mission_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "vision_text" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "mission_text" text;