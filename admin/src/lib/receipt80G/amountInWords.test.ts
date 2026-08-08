import { describe, expect, it } from 'vitest'
import { amountInWordsINR } from './amountInWords'

describe('amountInWordsINR', () => {
  it('converts whole rupee amounts', () => {
    expect(amountInWordsINR(5000)).toBe('Rupees Five Thousand Only')
    expect(amountInWordsINR(2000)).toBe('Rupees Two Thousand Only')
    expect(amountInWordsINR(1)).toBe('Rupee One Only')
  })

  it('includes paise when present', () => {
    expect(amountInWordsINR(5000.5)).toBe('Rupees Five Thousand and Fifty Paise Only')
  })

  it('handles large indian numbering', () => {
    expect(amountInWordsINR(10000000)).toBe('Rupees One Crore Only')
    expect(amountInWordsINR(250000)).toBe('Rupees Two Lakh Fifty Thousand Only')
  })
})
