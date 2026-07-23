import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

// These tests mutate the single global verification setting, so they must not interleave.
test.describe.configure({ mode: 'serial' });

const ADMIN = { email: 'owner@example.com', password: 'change-this-on-first-login' };
const EDITOR = { email: 'editor@example.com', password: 'editor-password' };

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('**/admin');
}

async function logout(page: Page) {
  await page.goto('/admin');
  await page.getByRole('button', { name: /sign out/i }).click();
  await page.waitForURL('**/login');
}

async function setVerification(page: Page, on: boolean) {
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto('/admin/settings');
  const box = page.getByRole('checkbox', { name: /require verification/i });
  if ((await box.isChecked()) !== on) await box.setChecked(on);
  await page.getByRole('button', { name: /save settings/i }).click();
  await expect(page.getByText('Saved.')).toBeVisible();
  await logout(page);
}

async function createAsEditor(page: Page, title: string) {
  await login(page, EDITOR.email, EDITOR.password);
  await page.goto('/admin/projects/new');
  await page.getByLabel('Title', { exact: true }).fill(title);
  await page.getByRole('button', { name: /create project/i }).click();
  await page.waitForURL('**/admin/projects/**');
  await logout(page);
}

test('editor submission is hidden until an admin approves it', async ({ page }) => {
  await setVerification(page, true);

  const title = `Review Me ${Date.now()}`;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  await createAsEditor(page, title);

  // Not visible publicly yet.
  await page.goto('/work');
  await expect(page.getByRole('heading', { name: title })).toHaveCount(0);

  // Admin approves it from the queue.
  await login(page, ADMIN.email, ADMIN.password);
  await page.goto('/admin/approvals');
  await expect(page.getByText(title)).toBeVisible();
  await page
    .getByRole('button', { name: /^approve$/i })
    .first()
    .click();
  await expect(page.getByText(title)).toHaveCount(0, { timeout: 15000 });
  await logout(page);

  // Now public.
  await page.goto(`/work/${slug}`);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
});

test('with verification off, an editor publishes directly', async ({ page }) => {
  await setVerification(page, false);

  const title = `Direct ${Date.now()}`;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  await createAsEditor(page, title);

  await page.goto(`/work/${slug}`);
  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  // Restore the default (verification on) so other runs start clean.
  await setVerification(page, true);
});
