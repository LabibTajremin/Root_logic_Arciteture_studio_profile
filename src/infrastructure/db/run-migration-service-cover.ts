import postgres from 'postgres';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required');
  const sql = postgres(url, { max: 1 });
  await sql.unsafe(`ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "cover_media_id" uuid;`);
  console.log('Service-cover migration applied.');
  await sql.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
