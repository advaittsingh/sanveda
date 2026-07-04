import { C } from '../../constants/brand'

import type { CSSProperties } from 'react'

export const donorCardStyle: CSSProperties = {
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  background: C.white,
  padding: 24,
}

export const donorSectionTitle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: C.primary,
  margin: '0 0 16px',
}

export const donorLabel: CSSProperties = {
  fontSize: 12,
  color: C.textMuted,
  marginBottom: 4,
}

export const donorInput: CSSProperties = {
  width: '100%',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

export const donorBtnPrimary: CSSProperties = {
  background: C.primary,
  color: C.white,
  border: 'none',
  borderRadius: 10,
  padding: '10px 18px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const donorBtnSecondary: CSSProperties = {
  background: C.white,
  color: C.primary,
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '10px 18px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer',
  fontFamily: 'inherit',
}
