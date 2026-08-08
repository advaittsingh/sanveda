import { C } from '../../../constants/brand'

/** Admin UI tokens aligned with public-site `brand.ts`. */
export const adminColors = {
  primary: C.primary,
  secondary: C.secondary,
  secondaryLight: C.secondaryLight,
  bg: C.cream,
  border: C.border,
} as const

/** Plain CSS classes in index.css — avoids Tailwind purge issues in production. */
export const adminInputClass = 'admin-input'
export const adminBtnPrimary = 'admin-btn-primary'
export const adminBtnSecondary = 'admin-btn-secondary'
export const adminBtnDanger = 'admin-btn-danger'
export const adminLabelClass = 'admin-label'
