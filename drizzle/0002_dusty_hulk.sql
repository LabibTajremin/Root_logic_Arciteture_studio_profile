ALTER TABLE "media_assets" ADD COLUMN "service_id" uuid;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logo_show_title" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "cover_media_id" uuid;--> statement-breakpoint
CREATE INDEX "idx_media_tenant_service_sort" ON "media_assets" USING btree ("tenant_id","service_id","sort_order");