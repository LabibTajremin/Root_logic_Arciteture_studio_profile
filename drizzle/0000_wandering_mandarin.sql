CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"custom_domain" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'editor' NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"must_change_password" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"body" text,
	"category_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"completed_at" timestamp with time zone,
	"location" text,
	"client_name" text,
	"area_sqft" integer,
	"cover_media_id" uuid,
	"created_by" uuid NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"project_id" uuid,
	"type" text DEFAULT 'image' NOT NULL,
	"storage_driver" smallint NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"width" integer,
	"height" integer,
	"duration_s" integer,
	"blurhash" text,
	"alt_text" text,
	"is_decorative" boolean DEFAULT false NOT NULL,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role_title" text,
	"bio" text,
	"photo_media_id" uuid,
	"socials" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seo_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"default_title" text,
	"default_description" text,
	"og_image_media_id" uuid,
	"ga_id" text,
	"gtm_id" text,
	"meta_pixel_id" text,
	"robots" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"studio_name" text NOT NULL,
	"tagline" text,
	"logo_light_media_id" uuid,
	"logo_dark_media_id" uuid,
	"contact_email" text,
	"contact_phone" text,
	"whatsapp" text,
	"address" text,
	"socials" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"nav_config" jsonb,
	"footer" jsonb,
	"editor_verification_required" boolean DEFAULT true NOT NULL,
	"media_ratios" jsonb DEFAULT '{"heroImage":"16:9","heroVideo":"16:9","projectCover":"4:5","projectGallery":"4:5","memberPhoto":"3:4","ogImage":"1.91:1"}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "theme_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"mode" text DEFAULT 'system' NOT NULL,
	"accent_id" text DEFAULT 'oxblood' NOT NULL,
	"custom_accent_hex" text,
	"pattern_id" text DEFAULT 'none' NOT NULL,
	"pattern_opacity" smallint DEFAULT 6 NOT NULL,
	"font_pair_id" text DEFAULT 'fraunces-manrope' NOT NULL,
	"font_overrides" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"heading_color_hex" text,
	"body_color_hex" text,
	"radius" text DEFAULT 'subtle' NOT NULL,
	"density" text DEFAULT 'comfortable' NOT NULL,
	"motion_level" text DEFAULT 'refined' NOT NULL,
	"grain" boolean DEFAULT false NOT NULL,
	"glass" boolean DEFAULT true NOT NULL,
	"hero_style" text DEFAULT 'full-bleed' NOT NULL,
	"motion_preset" text DEFAULT 'refined' NOT NULL,
	"scroll_reveal_style" text DEFAULT 'fade-up-soft' NOT NULL,
	"hero_animation" text DEFAULT 'ken-burns-drift' NOT NULL,
	"image_hover_style" text DEFAULT 'zoom' NOT NULL,
	"card_hover_style" text DEFAULT 'lift-shadow' NOT NULL,
	"page_transition" text DEFAULT 'fade' NOT NULL,
	"text_reveal_style" text DEFAULT 'mask-slide-up' NOT NULL,
	"cursor_style" text DEFAULT 'none' NOT NULL,
	"loader_style" text DEFAULT 'none' NOT NULL,
	"scroll_progress" boolean DEFAULT false NOT NULL,
	"smooth_scroll" boolean DEFAULT false NOT NULL,
	"parallax_intensity" smallint DEFAULT 20 NOT NULL,
	"motion_speed" smallint DEFAULT 100 NOT NULL,
	"stagger_ms" smallint DEFAULT 70 NOT NULL,
	"animate_once" boolean DEFAULT true NOT NULL,
	"motion_on_mobile" text DEFAULT 'reduced' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "awards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"issuer" text,
	"year" integer,
	"media_id" uuid,
	"link" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"logo_media_id" uuid,
	"website" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"group" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"eyebrow" text,
	"headline" text NOT NULL,
	"kicker_word" text,
	"body" text,
	"image_media_id" uuid,
	"video_media_id" uuid,
	"cta_label" text,
	"cta_href" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"step_no" integer NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"icon" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"icon_media_id" uuid,
	"excerpt" text,
	"body" text,
	"parent_id" uuid,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value_number" integer NOT NULL,
	"suffix" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text,
	"company" text,
	"quote" text NOT NULL,
	"avatar_media_id" uuid,
	"rating" smallint,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text,
	"icon" text,
	"sort_order" double precision DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"body" text,
	"cover_media_id" uuid,
	"author_id" uuid,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"published_at" timestamp with time zone,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"actor_id" uuid,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"diff" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"source" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "licences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key_fingerprint" text NOT NULL,
	"plan" text NOT NULL,
	"issued_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"submitted_by" uuid NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tenants_slug" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_tenants_custom_domain" ON "tenants" USING btree ("custom_domain");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_users_tenant_email" ON "users" USING btree ("tenant_id",lower("email"));--> statement-breakpoint
CREATE INDEX "idx_users_tenant_role" ON "users" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_categories_tenant_slug" ON "categories" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "idx_categories_tenant_sort" ON "categories" USING btree ("tenant_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_projects_tenant_slug" ON "projects" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "idx_projects_tenant_status_sort" ON "projects" USING btree ("tenant_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_projects_tenant_featured" ON "projects" USING btree ("tenant_id","is_featured") WHERE "projects"."status" = 'published';--> statement-breakpoint
CREATE INDEX "idx_projects_tenant_category" ON "projects" USING btree ("tenant_id","category_id");--> statement-breakpoint
CREATE INDEX "idx_projects_search" ON "projects" USING gin (to_tsvector('english', "title" || ' ' || coalesce("summary", '')));--> statement-breakpoint
CREATE INDEX "idx_projects_keyset" ON "projects" USING btree ("created_at","id");--> statement-breakpoint
CREATE INDEX "idx_media_tenant_project_sort" ON "media_assets" USING btree ("tenant_id","project_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_media_tenant_type" ON "media_assets" USING btree ("tenant_id","type");--> statement-breakpoint
CREATE INDEX "idx_media_status" ON "media_assets" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_members_tenant_status_sort" ON "members" USING btree ("tenant_id","status","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_seo_settings_tenant" ON "seo_settings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_site_settings_tenant" ON "site_settings" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_theme_settings_tenant" ON "theme_settings" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_awards_tenant_year" ON "awards" USING btree ("tenant_id","year");--> statement-breakpoint
CREATE INDEX "idx_clients_tenant_sort" ON "clients" USING btree ("tenant_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_faqs_tenant_status_sort" ON "faqs" USING btree ("tenant_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_hero_tenant_active_sort" ON "hero_slides" USING btree ("tenant_id","is_active","sort_order");--> statement-breakpoint
CREATE INDEX "idx_process_tenant_sort" ON "process_steps" USING btree ("tenant_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_services_tenant_slug" ON "services" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "idx_services_tenant_parent_sort" ON "services" USING btree ("tenant_id","parent_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_stats_tenant_sort" ON "stats" USING btree ("tenant_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_testimonials_tenant_status_sort" ON "testimonials" USING btree ("tenant_id","status","sort_order");--> statement-breakpoint
CREATE INDEX "idx_values_tenant_sort" ON "values" USING btree ("tenant_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_posts_tenant_slug" ON "posts" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "idx_posts_tenant_status_published" ON "posts" USING btree ("tenant_id","status","published_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_posts_tags" ON "posts" USING gin ("tags");--> statement-breakpoint
CREATE INDEX "idx_audit_tenant_created" ON "audit_log" USING btree ("tenant_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "idx_inquiries_tenant_read_created" ON "inquiries" USING btree ("tenant_id","is_read","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "uniq_licences_fingerprint" ON "licences" USING btree ("key_fingerprint");--> statement-breakpoint
CREATE INDEX "idx_revisions_tenant_status_created" ON "revisions" USING btree ("tenant_id","status","created_at" DESC NULLS LAST);