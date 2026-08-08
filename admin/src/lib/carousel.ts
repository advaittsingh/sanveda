export const CAMPAIGN_CAROUSEL_GAP = { mobile: 16, desktop: 24 } as const

export function getCampaignCarouselStep(el: HTMLElement, mobile: boolean, md: boolean): number {
  if (mobile) return el.clientWidth + CAMPAIGN_CAROUSEL_GAP.mobile
  if (md) return 360
  return 441
}

export function campaignCarouselItemStyle(mobile: boolean, md?: boolean) {
  if (mobile) {
    return {
      flex: '0 0 100%',
      width: '100%',
      minWidth: 0,
      scrollSnapAlign: 'start' as const,
      scrollSnapStop: 'always' as const,
    }
  }
  return {
    flexShrink: 0,
    scrollSnapAlign: md ? ('start' as const) : undefined,
  }
}
