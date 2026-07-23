import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const ADMIN = { email: 'owner@example.com', password: 'change-this-on-first-login' };

// A tiny valid 1x1 PNG (magic bytes pass the upload sniffer).
const PNG_1PX = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64',
);

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN.email);
  await page.getByLabel('Password').fill(ADMIN.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/admin');
}

test('admin can create a project, upload an image, set cover, publish, and see it public', async ({
  page,
}) => {
  await login(page);

  const unique = `E2E Project ${Date.now()}`;
  const slug = unique
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Create
  await page.goto('/admin/projects/new');
  await page.getByLabel('Title', { exact: true }).fill(unique);
  await page.getByRole('button', { name: /create project/i }).click();
  await page.waitForURL('**/admin/projects/**');
  await expect(page.getByRole('heading', { name: unique })).toBeVisible();

  // Upload an image
  await page.getByTestId('media-input').setInputFiles({
    name: 'demo.png',
    mimeType: 'image/png',
    buffer: PNG_1PX,
  });
  await expect(page.getByRole('button', { name: /set as cover/i }).first()).toBeVisible({
    timeout: 15000,
  });

  // Set cover
  await page
    .getByRole('button', { name: /set as cover/i })
    .first()
    .click();
  await expect(page.getByText('Cover', { exact: true })).toBeVisible({ timeout: 15000 });

  // Admin content auto-publishes (ContentVisibilityPolicy); if a draft, publish it.
  const publishBtn = page.getByRole('button', { name: /^publish$/i });
  if (await publishBtn.isVisible().catch(() => false)) {
    await publishBtn.click();
  }

  // Appears on the public work page
  await page.goto('/work');
  await expect(page.getByRole('heading', { name: unique })).toBeVisible();

  // And the detail page renders
  await page.goto(`/work/${slug}`);
  await expect(page.getByRole('heading', { name: unique })).toBeVisible();
});
