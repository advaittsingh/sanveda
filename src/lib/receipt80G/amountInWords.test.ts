import { describe, expect, it } from 'vitest'
import { amountInWordsINR } from './amountInWords'

describe('amountInWordsINR', () => {
  it('converts whole rupee amounts', () => {
    expect(amountInWordsINR(5000)).toBe('Five Thousand Rupees Only')
    expect(amountInWordsINR(1)).toBe('One Rupee Only')
  })

  it('includes paise when present', () => {
    expect(amountInWordsINR(5000.5)).toBe('Five Thousand Rupees and Fifty Paise Only')
  })

  it('handles large indian numbering', () => {
    expect(amountInWordsINR(10000000)).toBe('One Crore Rupees Only')
    expect(amountInWordsINR(250000)).toBe('Two Lakh Fifty Thousand Rupees Only')
  })
})
