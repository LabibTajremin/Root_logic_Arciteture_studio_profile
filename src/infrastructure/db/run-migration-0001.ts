import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });

  await sql.unsafe(`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "blog_enabled" boolean DEFAULT false NOT NULL;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "vision_mission_enabled" boolean DEFAULT false NOT NULL;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "vision_text" text;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "mission_text" text;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_show_title" boolean DEFAULT true NOT NULL;
  `);

  console.log('Migration 0001 applied.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
