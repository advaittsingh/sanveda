import type { ReactNode } from 'react'
import AdminLayout from './layout/AdminLayout'
import PageHeader from './ui/PageHeader'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  actions?: ReactNode
}

export default function AdminShell({ title, subtitle, children, actions }: Props) {
  return (
    <AdminLayout>
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      {children}
    </AdminLayout>
  )
}
