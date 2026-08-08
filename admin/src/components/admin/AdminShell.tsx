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
      <div className="admin-page mx-auto w-full max-w-[1920px]">
        <PageHeader title={title} subtitle={subtitle} actions={actions} />
        {children}
      </div>
    </AdminLayout>
  )
}
