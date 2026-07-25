import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });

  await sql.unsafe(`
    ALTER TABLE "media_assets" ADD COLUMN IF NOT EXISTS "service_id" uuid;
    CREATE INDEX IF NOT EXISTS "idx_media_tenant_service_sort"
      ON "media_assets" ("tenant_id", "service_id", "sort_order");
  `);

  console.log('Service-gallery migration applied.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
