import { test, expect } from '@playwright/test'

const API_BASE = process.env.VITE_API_BASE || 'http://localhost:8000/api/v1'

test('admin mapping resolve actions and audit trail appear in UI', async ({ page }) => {
  // Create a seller + listing
  const sellerResp = await page.request.post(`${API_BASE}/users/register`, {
    data: { username: 'e2e_admin_actions', email: 'e2e_admin_actions@example.com', password: 'pwd123' }
  })
  expect(sellerResp.ok()).toBeTruthy()

  const tokenResp = await page.request.post(`${API_BASE}/auth/token`, { form: { username: 'e2e_admin_actions', password: 'pwd123' } })
  expect(tokenResp.ok()).toBeTruthy()
  const tokenJson = await tokenResp.json()
  const token = tokenJson?.access_token
  expect(token).toBeTruthy()

  const headers = { Authorization: `Bearer ${token}` }

  const listingResp = await page.request.post(`${API_BASE}/listings/`, { data: { title: 'E2E Resolve Listing', price: 42.0, quantity: 1 }, headers })
  expect(listingResp.ok()).toBeTruthy()
  const listing = await listingResp.json()

  // create connector account and post listing to create a mapping
  const accResp = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts`, { data: { name: 'e2e-actions-demo', provider: 'demo' } })
  expect(accResp.ok()).toBeTruthy()
  const acc = await accResp.json()

  const postResp = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/post`, { data: { listing_id: listing.id } })
  expect(postResp.ok()).toBeTruthy()
  const mappingId = (await postResp.json()).mapping
  expect(mappingId).toBeTruthy()

  // Create an admin user and escalate via the test helper endpoint
  const adminUserResp = await page.request.post(`${API_BASE}/users/register`, { data: { username: 'e2e_admin_user', email: 'e2e_admin_user@example.com', password: 'pwd123' } })
  expect(adminUserResp.ok()).toBeTruthy()
  const adminUser = await adminUserResp.json()

  // escalate role (test helper) - only available in non-production test envs
  const escalateResp = await page.request.post(`${API_BASE}/test/users/${adminUser.id}/escalate`, { data: { role: 'ADMIN' } })
  expect(escalateResp.ok()).toBeTruthy()

  // get admin token
  const adminTokenResp = await page.request.post(`${API_BASE}/auth/token`, { form: { username: 'e2e_admin_user', password: 'pwd123' } })
  expect(adminTokenResp.ok()).toBeTruthy()
  const adminToken = (await adminTokenResp.json()).access_token
  expect(adminToken).toBeTruthy()

  const adminHeaders = { Authorization: `Bearer ${adminToken}` }

  // apply remote-wins
  const remoteWins = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/mappings/${mappingId}/resolve`, { data: { action: 'remote-wins' }, headers: adminHeaders })
  expect(remoteWins.ok()).toBeTruthy()
  expect((await remoteWins.json()).ok).toBeTruthy()

  // apply local-wins
  const localWins = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/mappings/${mappingId}/resolve`, { data: { action: 'local-wins' }, headers: adminHeaders })
  expect(localWins.ok()).toBeTruthy()
  expect((await localWins.json()).ok).toBeTruthy()

  // unlink mapping
  const unlink = await page.request.post(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/mappings/${mappingId}/resolve`, { data: { action: 'unlink' }, headers: adminHeaders })
  expect(unlink.ok()).toBeTruthy()
  expect((await unlink.json()).ok).toBeTruthy()

  // confirm audits exist via API
  const auditResp = await page.request.get(`${API_BASE}/integrations/marketplaces/accounts/${acc.account_id}/mappings/${mappingId}/audits`, { headers: adminHeaders })
  expect(auditResp.ok()).toBeTruthy()
  const audits = (await auditResp.json()).audits || []
  const actions = audits.map(a => a.meta?.action)
  expect(actions).toEqual(expect.arrayContaining(['remote-wins','local-wins','unlink']))

  // Now open the UI as admin and verify the mapping details show audit entries
  // Set the admin token in localStorage so axios in the app will include the Authorization header
  await page.addInitScript(token => localStorage.setItem('p2p_token', token), adminToken)

  await page.goto('/')
  await expect(page.locator('text=Admin — Connector Mappings')).toBeVisible({ timeout: 5000 })
  await page.click(`text=${acc.name}`)
  // wait for the mapping row for the mappingId and open its detail view
  const mappingRow = page.locator(`[data-mapping-id="${mappingId}"]`)
  await expect(mappingRow).toBeVisible({ timeout: 5000 })
  await mappingRow.locator(`button[data-testid="details-${mappingId}"]`).click()
  // audits should now be visible inside the mapping detail view
  await expect(page.locator('text=Audit trail')).toBeVisible({ timeout: 5000 })
  // check for at least one of the actions we applied
  await expect(page.locator('text=remote-wins')).toBeVisible({ timeout: 5000 })
})
