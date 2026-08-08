import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, UserCheck, MessageSquare, HandCoins } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminLayout } from '../../../context/AdminLayoutContext'
import { getEnquiries } from '../../../lib/enquiryService'
import { getVolunteerApplications } from '../../../lib/volunteerStore'
import { getMemberships } from '../../../lib/membershipService'

interface ActivityItem {
  id: string
  type: string
  title: string
  time: string
  link: string
  icon: typeof Bell
}

export default function NotificationDrawer() {
  const { notificationsOpen, setNotificationsOpen } = useAdminLayout()
  const [items, setItems] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!notificationsOpen) return
    let cancelled = false
    Promise.all([getEnquiries(), getVolunteerApplications(), getMemberships()])
      .then(([enquiries, volunteers, members]) => {
        if (cancelled) return
        const activity: ActivityItem[] = []

        enquiries
          .filter((e) => e.status === 'new')
          .slice(0, 5)
          .forEach((e) => {
            activity.push({
              id: `enq-${e.id}`,
              type: 'enquiry',
              title: `New enquiry from ${e.name}`,
              time: new Date(e.createdAt).toLocaleString(),
              link: '/admin/enquiries',
              icon: MessageSquare,
            })
          })

        volunteers
          .filter((v) => v.status === 'pending')
          .slice(0, 5)
          .forEach((v) => {
            activity.push({
              id: `vol-${v.id}`,
              type: 'volunteer',
              title: `Volunteer application: ${v.fullName}`,
              time: new Date(v.createdAt).toLocaleString(),
              link: '/admin/volunteers',
              icon: UserCheck,
            })
          })

        members
          .filter((m) => m.status === 'pending')
          .slice(0, 5)
          .forEach((m) => {
            activity.push({
              id: `mem-${m.id}`,
              type: 'member',
              title: `Membership application: ${m.fullName}`,
              time: new Date(m.createdAt).toLocaleString(),
              link: '/admin/memberships',
              icon: HandCoins,
            })
          })

        setItems(activity.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 12))
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [notificationsOpen])

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Close notifications"
          />
          <motion.aside
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-[#E5E7EB] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-[#0B2C6B]" />
                <h2 className="font-semibold text-[#0B2C6B]">Activity</h2>
              </div>
              <button type="button" onClick={() => setNotificationsOpen(false)} className="rounded-lg p-2 hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {items.length === 0 ? (
                <p className="p-6 text-center text-sm text-slate-500">No pending activity right now.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <li key={item.id}>
                        <Link
                          to={item.link}
                          onClick={() => setNotificationsOpen(false)}
                          className="flex gap-3 rounded-xl border border-[#E5E7EB] p-3 transition hover:bg-[#F8FAFC]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B2C6B]/10 text-[#0B2C6B]">
                            <Icon size={16} />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800">{item.title}</p>
                            <p className="text-xs text-slate-500">{item.time}</p>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
