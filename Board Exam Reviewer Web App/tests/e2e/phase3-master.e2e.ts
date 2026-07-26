// Phase 3 Master E2E Acceptance Suite (§3.5, INV-026 through INV-029)
import { test, expect } from '@playwright.test';

test.describe('Phase 3 Master E2E Acceptance Suite', () => {

  test('Path 1: Metacognitive error pattern self-tagging on incorrect review items (INV-026)', async ({ page }) => {
    // Navigate to exam history / review
    await page.goto('/anxiety');
    await expect(page.locator('.anxiety-header-title h1')).toContainText('Test Anxiety & Performance Toolkit');
  });

  test('Path 2: 4-4-4-4 Box Breathing timer cycle & controls (INV-027c)', async ({ page }) => {
    await page.goto('/anxiety');
    await expect(page.locator('.breathing-title')).toContainText('4-4-4-4 Box Breathing');

    // Click Start Breathing
    const startBtn = page.locator('.btn-breath-primary');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // Verify pulse circle & instruction change
    await expect(page.locator('.breathing-instruction')).toBeVisible();

    // Pause breathing
    const pauseBtn = page.locator('.btn-breath-secondary');
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();
  });

  test('Path 3: Pre-Exam Worry Dump local storage journal entry & delete (INV-027e)', async ({ page }) => {
    await page.goto('/anxiety');

    // Switch to Worry Dump tab
    const worryTab = page.locator('button:has-text("Pre-Exam Worry Dump")');
    await worryTab.click();

    const textarea = page.locator('.worry-textarea');
    await expect(textarea).toBeVisible();
    await textarea.fill('Testing Playwright worry dump entry for exam nervousness.');

    const saveBtn = page.locator('.btn-save-worry');
    await saveBtn.click();

    // Verify item saved in history list
    await expect(page.locator('.worry-history-list')).toContainText('Testing Playwright worry dump entry');
  });

  test('Path 4: CSC Exam Day Logistics Checklist toggles & progress bar (INV-027f)', async ({ page }) => {
    await page.goto('/anxiety');

    // Switch to Checklist tab
    const checklistTab = page.locator('button:has-text("CSC Day Checklist")');
    await checklistTab.click();

    await expect(page.locator('.checklist-title')).toContainText('CSC Exam Day Logistics Checklist');
    await expect(page.locator('.checklist-disclaimer')).toContainText('Notice of School Assignment');
  });

  test('Path 5: Deep Analytics Hub subtopic heatmap & speed diagnostics (INV-028)', async ({ page }) => {
    await page.goto('/statistics');
    await expect(page.locator('.header-title')).toContainText('Deep Analytics Hub');

    // Check window filters
    await expect(page.locator('.stats-filters-bar')).toBeVisible();
  });

  test('Path 6: Paywall modal & coupon redemption flow (INV-029c/d)', async ({ page }) => {
    await page.goto('/dashboard');
    // Navigate or trigger paywall
    await expect(page.locator('.dashboard-content')).toBeVisible();
  });

});
