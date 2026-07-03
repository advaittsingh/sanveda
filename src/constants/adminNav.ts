import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BookOpen,
  Calendar,
  FileText,
  FolderKanban,
  HandCoins,
  Heart,
  Image,
  LayoutDashboard,
  Megaphone,
  Receipt,
  Repeat,
  Settings,
  Shield,
  Users,
  Wallet,
  ClipboardList,
  GraduationCap,
  MessageSquare,
  Layers,
  FileCheck,
  UserCog,
  ScrollText,
} from 'lucide-react'

export interface AdminNavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: string
}

export interface AdminNavGroup {
  title: string
  items: AdminNavItem[]
}

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    title: '',
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard }],
  },
  {
    title: 'Fundraising',
    items: [
      { label: 'Campaigns', to: '/admin/campaigns', icon: Megaphone },
      { label: 'Donations', to: '/admin/donations', icon: HandCoins },
      { label: 'Monthly Giving', to: '/admin/monthly-giving', icon: Repeat },
      { label: 'Transactions', to: '/admin/transactions', icon: Receipt },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Donors', to: '/admin/donors', icon: Users },
      { label: 'Volunteers', to: '/admin/volunteers', icon: Heart },
      { label: 'Members', to: '/admin/memberships', icon: UserCog },
      { label: 'Beneficiaries', to: '/admin/beneficiaries', icon: Users },
      { label: 'Internships', to: '/admin/internships', icon: GraduationCap },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Projects', to: '/admin/projects', icon: FolderKanban },
      { label: 'Events', to: '/admin/events', icon: Calendar },
      { label: 'Focus Areas', to: '/admin/focus-areas', icon: Layers },
      { label: 'Gallery', to: '/admin/gallery', icon: Image },
      { label: 'Documents', to: '/admin/documents', icon: FileText },
      { label: 'Enquiries', to: '/admin/enquiries', icon: MessageSquare },
    ],
  },
  {
    title: 'Finance',
    items: [
      { label: 'Overview', to: '/admin/finance', icon: BarChart3 },
      { label: 'Income', to: '/admin/income', icon: Wallet },
      { label: 'Expenses', to: '/admin/expenses', icon: Receipt },
      { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
      { label: 'Tax Receipts', to: '/admin/tax-receipts', icon: FileCheck },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Blogs', to: '/admin/blogs', icon: BookOpen },
      { label: 'CMS', to: '/admin/cms', icon: ClipboardList },
      { label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquare },
    ],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Users', to: '/admin/users', icon: Users },
      { label: 'Roles', to: '/admin/roles', icon: Shield },
      { label: 'Audit Logs', to: '/admin/audit', icon: ScrollText },
      { label: 'Settings', to: '/admin/settings', icon: Settings },
    ],
  },
]

export const ADMIN_PRIMARY = '#0B2C6B'
export const ADMIN_SECONDARY = '#0E4FA8'
export const ADMIN_BG = '#F8FAFC'
export const ADMIN_BORDER = '#E5E7EB'
