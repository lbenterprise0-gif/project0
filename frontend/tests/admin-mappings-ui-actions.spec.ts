import { test, expect } from '@playwright/test'

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

test('admin mapping UI resolve interactions and audit appear', async ({ page }) => {
  // create seller and listing
  const sellerResp = await page.request.post(`${API_BASE}/users/register`, { data: { username: 'e2e_ui_seller', email: 'e2e_ui_seller@example.com', password: 'pwd123' } })
  expect(sellerResp.ok()).toBeTruthy()

  const tokenResp = await page.request.post(`${API_BASE}/auth/token`, { form: { username: 'e2e_ui_seller', password: 'pwd123' } })
  expect(tokenResp.ok()).toBeTruthy()
  const token = (await tokenResp.json()).access_token
  const headers = { Authorization: `Bearer ${token}` }

  const listingResp = await page.request.post(`${API_BASE}/listings/`, { data: { title: 'UI Resolve Listing', price: 13.0, quantity: 1 }, headers })
  expect(listingResp.ok()).toBeTruthy()
  const listing = await listingResp.json()

  const accResp = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts`, { data: { name: 'e2e-ui-demo', provider: 'demo' } })
  expect(accResp.ok()).toBeTruthy()
  const acc = await accResp.json()

  const postResp = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/post`, { data: { listing_id: listing.id } })
  expect(postResp.ok()).toBeTruthy()
  const mappingId = (await postResp.json()).mapping

  // create admin user and escalate
  const adminReg = await page.request.post(`${API_BASE}/users/register`, { data: { username: 'e2e_ui_admin', email: 'e2e_ui_admin@example.com', password: 'pwd123' } })
  expect(adminReg.ok()).toBeTruthy()
  const adminUser = await adminReg.json()

  const esc = await page.request.post(`${API_BASE}/test/users/${adminUser.id}/escalate`, { data: { role: 'ADMIN' } })
  expect(esc.ok()).toBeTruthy()

  const adminTok = (await page.request.post(`${API_BASE}/auth/token`, { form: { username: 'e2e_ui_admin', password: 'pwd123' } })).json()
  expect(adminTok).toBeTruthy()
  const adminToken = (await adminTok).access_token

  // access UI as admin
  await page.addInitScript(token => localStorage.setItem('p2p_token', token), adminToken)
  await page.goto('/')
  await expect(page.locator('text=Admin — Connector Mappings')).toBeVisible({ timeout: 5000 })
  await page.click(`text=${acc.name}`)
  // ensure all dialogs are accepted (the app shows an alert on resolve)
  page.on('dialog', async dialog => { await dialog.accept() })

  // wait for the created mapping row and click 'Details' for that mapping
  const mappingRow = page.locator(`[data-mapping-id="${mappingId}"]`)
  await expect(mappingRow).toBeVisible({ timeout: 5000 })
  await mappingRow.locator(`button[data-testid="details-${mappingId}"]`).click()

  // Remote wins - UI triggers a resolve via API; the app refreshes mappings
  await mappingRow.locator(`button[data-testid="remote-${mappingId}"]`).click()

  // Wait for audit trail to refresh and show action
  await expect(page.locator('text=Audit trail')).toBeVisible({ timeout: 5000 })
  await expect(page.locator('text=remote-wins')).toBeVisible({ timeout: 5000 })

  // Local wins
  await mappingRow.locator(`button[data-testid="local-${mappingId}"]`).click()
  // accept any dialog
  // Allow a small pause for API update
  await page.waitForTimeout(400)
  await expect(page.locator('text=local-wins')).toBeVisible({ timeout: 5000 })

  // Unlink
  await mappingRow.locator(`button[data-testid="unlink-${mappingId}"]`).click()
  await page.waitForTimeout(400)
  await expect(page.locator('text=unlink')).toBeVisible({ timeout: 5000 })
})
