import type { FocusArea } from '../../constants/focusAreas'

interface Props {
  area: FocusArea
  mobile?: boolean
}

export default function FocusStats({ area, mobile }: Props) {
  void area
  void mobile
  return null
}
