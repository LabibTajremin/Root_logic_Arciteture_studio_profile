import { generateKeyPairSync, sign as edSign } from 'node:crypto';

/**
 * Issues an Ed25519 licence key.
 *
 *   pnpm tsx scripts/generate-licence.ts <subject> [plan] [expiresISO]
 *
 * Prints the public key (LICENCE_PUBLIC_KEY, ship in the deployment) and the signed
 * licence key (LICENCE_KEY, give to the client). Keep the private key output secret.
 */
const [, , subject, plan = 'pro', expiresAt = null] = process.argv;
if (!subject) {
  console.error('Usage: tsx scripts/generate-licence.ts <subject> [plan] [expiresISO]');
  process.exit(1);
}

const { publicKey, privateKey } = generateKeyPairSync('ed25519');
const payload = { plan, issuedAt: new Date().toISOString(), expiresAt, subject };
const raw = Buffer.from(JSON.stringify(payload), 'utf8');
const signature = edSign(null, raw, privateKey);
const licenceKey = `${raw.toString('base64')}.${signature.toString('base64')}`;

console.log(
  'LICENCE_PUBLIC_KEY=' + publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
);
console.log('LICENCE_KEY=' + licenceKey);
console.log('\n# Keep this private key secret (reuse it to sign future keys):');
console.log(privateKey.export({ format: 'pem', type: 'pkcs8' }).toString().trim());
