ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "service_id" uuid;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_show_title" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cover_media_id" uuid;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_media_tenant_service_sort" ON "media_assets" USING btree ("tenant_id","service_id","sort_order");