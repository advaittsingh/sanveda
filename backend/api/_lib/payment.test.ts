import { describe, expect, it } from 'vitest'
import { hmacSha256, sha256, timingSafeEqualHex, validateCapturedPayment } from './payment.js'

describe('payment verification primitives', () => {
  it('verifies signatures without accepting malformed digests', () => {
    const signature = hmacSha256('secret', 'order_1|pay_1')
    expect(timingSafeEqualHex(signature, signature)).toBe(true)
    expect(timingSafeEqualHex(signature, `${signature.slice(0, -1)}0`)).toBe(false)
    expect(timingSafeEqualHex(signature, 'not-hex')).toBe(false)
  })

  it('verifies subscription auth signatures as payment_id|subscription_id', () => {
    const signature = hmacSha256('secret', 'pay_1|sub_1')
    expect(timingSafeEqualHex(signature, hmacSha256('secret', 'pay_1|sub_1'))).toBe(true)
    expect(timingSafeEqualHex(signature, hmacSha256('secret', 'sub_1|pay_1'))).toBe(false)
  })

  it('produces stable payload hashes for idempotency records', () => {
    expect(sha256('gateway-event')).toBe(sha256(Buffer.from('gateway-event')))
    expect(sha256('gateway-event')).not.toBe(sha256('other-event'))
  })

  it('rejects a captured payment bound to another donation', () => {
    expect(() =>
      validateCapturedPayment(
        'donation-1',
        50000,
        'INR',
        {
          id: 'order_1',
          amount: 50000,
          amount_paid: 50000,
          currency: 'INR',
          status: 'paid',
          notes: { donation_id: 'donation-2' },
        },
        {
          id: 'pay_1',
          order_id: 'order_1',
          amount: 50000,
          currency: 'INR',
          status: 'captured',
          captured: true,
        },
      ),
    ).toThrow(/binding mismatch/)
  })

  it('rejects captured payments missing an order binding', () => {
    expect(() =>
      validateCapturedPayment(
        'donation-1',
        50000,
        'INR',
        {
          id: 'order_1',
          amount: 50000,
          amount_paid: 50000,
          currency: 'INR',
          status: 'paid',
          notes: { donation_id: 'donation-1' },
        },
        {
          id: 'pay_1',
          order_id: null,
          amount: 50000,
          currency: 'INR',
          status: 'captured',
          captured: true,
        },
      ),
    ).toThrow(/not linked/)
  })
})
