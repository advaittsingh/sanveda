import { C } from '../../../constants/brand'

/** Admin UI tokens aligned with public-site `brand.ts`. */
export const adminColors = {
  primary: C.primary,
  secondary: C.secondary,
  secondaryLight: C.secondaryLight,
  bg: C.cream,
  border: C.border,
} as const

export const adminInputClass =
  `w-full rounded-xl border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[${C.primary}]/30 focus:ring-2 focus:ring-[${C.primary}]/10`

export const adminBtnPrimary =
  `inline-flex items-center justify-center rounded-xl bg-[${C.primary}] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50`

export const adminBtnSecondary =
  'inline-flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-[#F5F7FA]'

export const adminBtnDanger =
  'inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100'

export const adminLabelClass = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500'
