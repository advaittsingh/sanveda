import type { CSSProperties } from 'react'
import { C } from './brand'

function baseSectionStyle(mobile: boolean, overrides?: CSSProperties): CSSProperties {
  return {
    width: mobile ? '100%' : '94.44%',
    maxWidth: 1440,
    margin: `${mobile ? 20 : 40}px auto 40px`,
    padding: mobile ? '26px 0 20px' : '60px 0 40px',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...overrides,
  }
}

export function sectionShellStyle(mobile: boolean, overrides?: CSSProperties): CSSProperties {
  return baseSectionStyle(mobile, overrides)
}

export function creamSectionStyle(mobile: boolean, overrides?: CSSProperties): CSSProperties {
  return baseSectionStyle(mobile, {
    borderRadius: mobile ? 16 : 36,
    backgroundColor: C.cream,
    border: '1px solid rgba(212,164,55,0.2)',
    ...overrides,
  })
}

export const HERO_BANNER_ASPECT = '1024 / 672'

export function heroSectionStyle(mobile: boolean, overrides?: CSSProperties): CSSProperties {
  return {
    width: mobile ? '100%' : '94.44%',
    maxWidth: 1440,
    margin: `0 auto ${mobile ? 20 : 40}px`,
    padding: 0,
    position: 'relative',
    boxSizing: 'border-box',
    ...overrides,
  }
}
