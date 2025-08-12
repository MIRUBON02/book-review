import { test, expect } from '@playwright/test';

// 1)不正な入力でエラーが表示される
test('invalid inputs show error messages', async ({ page }) => {
  await page.goto('/');

  // 空で送信
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.locator('#email-error')).toBeVisible();
  await expect(page.locator('#password-error')).toBeVisible();
});

  // email　形式エラー(パスワードは正しい)
  test('invalid email shows error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('メールアドレス').fill('not-an-email');
  await page.getByLabel('パスワード').fill('secretsecret');  // minLength=8 を満たす
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.locator('#email-error')).toBeVisible();
  await expect(page.locator('#password-error')).toHaveCount(0);
});

// パスワード　形式エラー(メールアドレスは正しい)
test('invalid password shows error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('メールアドレス').fill('user@example.com'); // 正常
  await page.getByLabel('パスワード').fill('123');                  // minLength未満
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.locator('#password-error')).toBeVisible();
  await expect(page.locator('#email-error')).toHaveCount(0);
});

// 2)正しい入力でエラーが表示されない
test('valid inputs do not show errors', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('メールアドレス').fill('user@example.com');
  await page.getByLabel('パスワード').fill('secretsecret'); // 8文字以上
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.locator('#email-error')).toHaveCount(0);
  await expect(page.locator('#password-error')).toHaveCount(0);
});


