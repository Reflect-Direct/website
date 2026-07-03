const { test, expect } = require('@playwright/test');

test.describe('Page load', () => {
  test('loads with correct title and hero content', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Reflect\.Direct/);
    await expect(page.locator('h1')).toContainText('Continuous Reflection');
  });

  test('all key sections exist', async ({ page }) => {
    await page.goto('/');
    for (const id of ['top', 'how-it-works', 'features', 'built-for', 'resources', 'contact']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
  });
});

test.describe('Navigation', () => {
  test('header nav links scroll to matching sections', async ({ page }) => {
    await page.goto('/');
    const links = [
      { text: 'How it works', target: '#how-it-works' },
      { text: 'Features', target: '#features' },
      { text: 'Built for', target: '#built-for' },
      { text: 'Resources', target: '#resources' },
    ];
    for (const { text, target } of links) {
      await page.locator('.site-nav').getByRole('link', { name: text }).click();
      await expect(page).toHaveURL(new RegExp(`${target}$`));
      await expect(page.locator(target)).toBeInViewport();
    }
  });

  test('Get Started buttons link to contact section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.header-row .btn-primary')).toHaveAttribute('href', '#contact');
  });
});

test.describe('Contact form', () => {
  test('shows validation and does not submit empty form', async ({ page }) => {
    await page.goto('/#contact');
    await page.locator('#contact-form button[type="submit"]').click();
    // Native "required" validation should block submission; success box stays hidden.
    await expect(page.locator('#contact-success')).toBeHidden();
  });

  test('successful submission shows success state and hides the form', async ({ page }) => {
    // Mock FormSubmit so CI never sends a real email.
    await page.route('https://formsubmit.co/ajax/**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: 'true', message: 'mocked' }),
      })
    );

    await page.goto('/#contact');
    await page.fill('#contact-form input[name="name"]', 'Test User');
    await page.fill('#contact-form input[name="email"]', 'test@example.com');
    await page.locator('#contact-form button[type="submit"]').click();

    const success = page.locator('#contact-success');
    await expect(success).toBeVisible();
    await expect(success).toContainText('test@example.com');

    // Regression guard for the display:flex / [hidden] specificity bug.
    await expect(page.locator('#contact-form')).toBeHidden();
  });

  test('failed submission re-enables the button and shows an alert', async ({ page }) => {
    await page.route('https://formsubmit.co/ajax/**', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
    );

    page.once('dialog', (dialog) => dialog.accept());

    await page.goto('/#contact');
    await page.fill('#contact-form input[name="name"]', 'Test User');
    await page.fill('#contact-form input[name="email"]', 'test@example.com');
    await page.locator('#contact-form button[type="submit"]').click();

    const submitBtn = page.locator('#contact-form button[type="submit"]');
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toHaveText(/Send my details/);
  });
});

test.describe('Responsive layout', () => {
  test('mobile viewport collapses nav and stacks hero', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await expect(page.locator('.site-nav')).toBeHidden();

    // No horizontal scroll/overflow at mobile width.
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    );
    expect(hasOverflow).toBeFalsy();
  });

  test('desktop viewport shows full nav', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('.site-nav')).toBeVisible();
  });
});
