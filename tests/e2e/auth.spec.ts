import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const ADMIN = { email: 'owner@example.com', password: 'change-this-on-first-login' };
const EDITOR = { email: 'editor@example.com', password: 'editor-password' };

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

test.describe('authentication & RBAC', () => {
  test('admin can log in and reach the dashboard', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.waitForURL('**/admin');
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('invalid credentials are rejected', async ({ page }) => {
    await login(page, ADMIN.email, 'wrong-password');
    await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  });

  test('admin can view the Users page', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.waitForURL('**/admin');
    await page.goto('/admin/users');
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  });

  test('editor cannot reach /admin/users', async ({ page }) => {
    await login(page, EDITOR.email, EDITOR.password);
    await page.waitForURL('**/admin');
    await page.goto('/admin/users');
    // Middleware blocks the editor; they never see the Users heading.
    await expect(page).not.toHaveURL(/\/admin\/users$/);
    await expect(page.getByRole('heading', { name: 'Users' })).toHaveCount(0);
  });

  test('unauthenticated visitors are redirected to login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('**/login**');
    await expect(page.getByRole('heading', { name: /admin sign in/i })).toBeVisible();
  });
});
