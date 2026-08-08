import { HardDrive, Image, Layers, Play, Upload } from 'lucide-react'
import StatCard from '../ui/StatCard'
import type { GalleryDashboardData } from '../../../lib/galleryOperationsService'

interface Props {
  kpis: GalleryDashboardData['kpis']
}

export default function GalleryKpiCards({ kpis }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <StatCard label="Total Albums" value={kpis.totalAlbums} icon={Layers} delay={0} />
      <StatCard label="Total Media Files" value={kpis.totalMediaFiles} icon={Upload} accent="blue" delay={0.05} />
      <StatCard label="Photos" value={kpis.photos} icon={Image} accent="green" delay={0.1} />
      <StatCard label="Videos" value={kpis.videos} icon={Play} accent="secondary" delay={0.15} />
      <StatCard label="Storage Used" value={kpis.storageUsedGb} suffix=" GB" icon={HardDrive} accent="secondary" delay={0.2} />
      <StatCard label="Published Albums" value={kpis.publishedAlbums} icon={Layers} accent="green" delay={0.25} />
    </div>
  )
}
