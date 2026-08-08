import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('@a11y homepage has accessibility foundations', async ({ page }) => {
  await page.goto('/')

  const skipLink = page.getByRole('link', { name: 'Skip to main content' })
  await skipLink.focus()
  await expect(skipLink).toBeFocused()
  await skipLink.press('Enter')
  await expect(page.locator('#main-content')).toBeFocused()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    // Legacy campaign cards require a structural redesign before these rules can be enforced.
    .disableRules(['color-contrast', 'nested-interactive'])
    .analyze()

  expect(results.violations).toEqual([])
})

test('@a11y mobile navigation is keyboard operable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  const openMenu = page.getByRole('button', { name: 'Open menu' })
  await openMenu.click()
  await expect(page.getByRole('dialog', { name: 'SANVEDA' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close menu' })).toBeFocused()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'SANVEDA' })).toBeHidden()
  await expect(openMenu).toBeFocused()
})
