import { test, expect } from '@playwright/test'

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

// This E2E test assumes the backend is running and accessible at API_BASE
// It performs a simple end-to-end flow: create a user + listing, create connector account, post listing,
// open the frontend Admin page, and check that mappings/audits appear in the admin UI.

test('admin mapping flow (smoke)', async ({ page }) => {
  // Create seller + listing via API
  const sellerResp = await page.request.post(`${API_BASE}/users/register`, {
    data: { username: 'e2e_admin_seller', email: 'e2e_admin_seller@example.com', password: 'pwd123' }
  })
  expect(sellerResp.ok()).toBeTruthy()

  // Authenticate seller
  const tokenResp = await page.request.post(`${API_BASE}/auth/token`, { form: { username: 'e2e_admin_seller', password: 'pwd123' } })
  expect(tokenResp.ok()).toBeTruthy()
  const tokenJson = await tokenResp.json()
  const token = tokenJson?.access_token
  expect(token).toBeTruthy()

  const headers = { Authorization: `Bearer ${token}` }

  // Create listing
  const listingResp = await page.request.post(`${API_BASE}/listings/`, { data: { title: 'E2E Listing', price: 12.3, quantity: 2 }, headers })
  expect(listingResp.ok()).toBeTruthy()
  const listing = await listingResp.json()

  // create connector account
  const accResp = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts`, { data: { name: 'e2e-demo', provider: 'demo' } })
  expect(accResp.ok()).toBeTruthy()
  const acc = await accResp.json()

  // post listing to connector (simulate remote mapping)
  const postResp = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/post`, { data: { listing_id: listing.id } })
  expect(postResp.ok()).toBeTruthy()

  // navigate to the frontend admin page and ensure mappings can be fetched
  await page.goto('/')
  // click Admin section (simple selector) — the UI is a simple scaffold so we look for mappings header
  await expect(page.locator('text=Admin — Connector Mappings')).toBeVisible({ timeout: 5000 })

  // wait a little then attempt to click the connector account and verify the mapping row exists
  await page.click('text=e2e-demo')
  // mapping row will list "Remote ID" or local id
  await expect(page.locator('text=Remote ID')).toBeVisible({ timeout: 5000 })
})
