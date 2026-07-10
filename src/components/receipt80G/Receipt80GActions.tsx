import { useState } from 'react'
import { Copy, Download, Eye, Mail, Printer, RefreshCw } from 'lucide-react'
import type { Receipt80GData } from '../../lib/receipt80G/types'
import {
  copyReceiptVerificationLink,
  downloadReceipt80G,
  emailReceipt80G,
  printReceipt80G,
  viewReceipt80GHtml,
} from '../../lib/receipt80G/receipt80GService'
import { adminBtnPrimary, adminBtnSecondary } from '../admin/ui/adminStyles'

interface Props {
  data: Receipt80GData
  compact?: boolean
  onRegenerate?: () => Promise<void>
  onDownload?: () => Promise<void>
  onEmail?: () => Promise<void>
}

export default function Receipt80GActions({ data, compact, onRegenerate, onDownload, onEmail }: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const runAction = async (key: string, fn: () => Promise<void> | void) => {
    setBusy(key)
    setMessage('')
    try {
      await fn()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  const actions = [
    { key: 'view', label: 'View', icon: Eye, run: () => viewReceipt80GHtml(data) },
    { key: 'download', label: 'Download PDF', icon: Download, run: async () => {
      await downloadReceipt80G(data)
      await onDownload?.()
    }},
    { key: 'print', label: 'Print', icon: Printer, run: () => printReceipt80G(data) },
    { key: 'email', label: 'Email Receipt', icon: Mail, run: async () => {
      const ok = await emailReceipt80G(data)
      if (!ok) throw new Error('Could not send receipt email')
      await onEmail?.()
      setMessage('Receipt email sent')
    }},
    { key: 'copy', label: 'Copy Verify Link', icon: Copy, run: async () => {
      await copyReceiptVerificationLink(data)
      setMessage('Verification link copied')
    }},
    ...(onRegenerate ? [{
      key: 'regen',
      label: data.isReissued ? 'Reissued' : 'Regenerate',
      icon: RefreshCw,
      run: async () => {
        await onRegenerate()
        setMessage('Receipt regenerated')
      },
    }] : []),
  ]

  return (
    <div>
      <div className={`flex flex-wrap gap-2 ${compact ? '' : ''}`}>
        {actions.map(({ key, label, icon: Icon, run: action }) => (
          <button
            key={key}
            type="button"
            className={key === 'email' ? adminBtnPrimary : adminBtnSecondary}
            disabled={busy !== null}
            onClick={() => runAction(key, action)}
          >
            <Icon size={14} className={`mr-1.5 ${busy === key ? 'animate-spin' : ''}`} />
            {busy === key ? 'Working…' : label}
          </button>
        ))}
      </div>
      {message ? <p className="mt-2 text-sm text-emerald-700">{message}</p> : null}
    </div>
  )
}
