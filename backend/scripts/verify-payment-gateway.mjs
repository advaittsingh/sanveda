#!/usr/bin/env node
/**
 * Smoke-check Razorpay + Sanveda payment API wiring (test mode).
 * Usage:
 *   node --env-file=.env scripts/verify-payment-gateway.mjs
 *   VERIFY_BASE_URL=https://sanveda.vercel.app node --env-file=.env scripts/verify-payment-gateway.mjs
 */
const baseURL = (process.env.VERIFY_BASE_URL || 'https://sanveda.vercel.app').replace(/\/$/, '')
const keyId = process.env.RAZORPAY_KEY_ID || ''
const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function main() {
  const report = {
    baseURL,
    keyIdPrefix: keyId.slice(0, 12) || null,
    isTestKey: keyId.startsWith('rzp_test_'),
    checks: [],
  }

  assert(keyId && keySecret, 'RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing in env')
  assert(keyId.startsWith('rzp_test_'), 'Refusing to run against non-test Razorpay keys')

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
  const direct = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 10000,
      currency: 'INR',
      receipt: `gw-check-${Date.now()}`,
    }),
  })
  const directBody = await direct.json().catch(() => ({}))
  report.checks.push({
    label: 'Razorpay API auth (direct)',
    status: direct.status,
    ok: direct.ok,
    message: directBody.error?.description ?? directBody.id ?? null,
  })
  if (!direct.ok) {
    console.log(JSON.stringify({ ok: false, ...report }, null, 2))
    process.exit(2)
  }

  const checkoutRes = await fetch(`${baseURL}/api/data/functions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'create_pending_donation_checkout',
      args: {
        p_campaign_title: 'Gateway verify',
        p_amount: 100,
        p_currency: 'INR',
        p_campaign_id: null,
        p_campaign_slug: 'flood-relief-2026',
        p_is_anonymous: false,
        p_donor_name: 'Gateway Verify',
        p_donor_email: 'e2e.payment@sanveda.org',
        p_donor_phone: '9999999999',
      },
    }),
  })
  const checkout = await checkoutRes.json()
  report.checks.push({
    label: 'create_pending_donation_checkout',
    status: checkoutRes.status,
    ok: checkoutRes.ok,
    donationId: checkout.data?.donation?.id ?? null,
  })
  assert(checkoutRes.ok && checkout.data?.donation?.id, 'Checkout create failed')

  const orderRes = await fetch(`${baseURL}/api/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      donationId: checkout.data.donation.id,
      checkoutToken: checkout.data.checkoutToken,
    }),
  })
  const order = await orderRes.json()
  report.checks.push({
    label: 'POST /api/payments/create-order',
    status: orderRes.status,
    ok: orderRes.ok,
    orderId: order.orderId ?? null,
    message: order.message ?? null,
  })
  assert(orderRes.ok && order.orderId, `create-order failed: ${order.message ?? orderRes.status}`)

  console.log(JSON.stringify({ ok: true, ...report }, null, 2))
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
  process.exit(1)
})
