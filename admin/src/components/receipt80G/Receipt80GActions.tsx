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
  /** Prefer in-app preview (avoids pop-up blockers). */
  onView?: () => void
  /** Hide View when the receipt is already shown in a modal/preview. */
  hideView?: boolean
  onRegenerate?: () => Promise<void>
  onDownload?: () => Promise<void>
  /** Called after a successful send — should only mark status, not send again. */
  onEmail?: () => Promise<void>
}

export default function Receipt80GActions({
  data,
  compact,
  onView,
  hideView,
  onRegenerate,
  onDownload,
  onEmail,
}: Props) {
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [messageTone, setMessageTone] = useState<'ok' | 'error'>('ok')

  const runAction = async (key: string, fn: () => Promise<void> | void, successMessage?: string) => {
    setBusy(key)
    setMessage('')
    try {
      await fn()
      if (successMessage) {
        setMessageTone('ok')
        setMessage(successMessage)
      }
    } catch (err) {
      setMessageTone('error')
      setMessage(err instanceof Error ? err.message : 'Action failed')
    } finally {
      setBusy(null)
    }
  }

  const busyLabel: Record<string, string> = {
    view: 'Opening…',
    download: 'Generating PDF…',
    print: 'Preparing print…',
    email: 'Sending email…',
    copy: 'Copying…',
    regen: 'Regenerating…',
  }

  const actions = [
    ...(!hideView
      ? [{
          key: 'view',
          label: 'View',
          icon: Eye,
          success: onView ? 'Receipt preview opened.' : 'Receipt opened in a new tab.',
          run: () => {
            if (onView) {
              onView()
              return
            }
            viewReceipt80GHtml(data)
          },
        }]
      : []),
    {
      key: 'download',
      label: 'Download PDF',
      icon: Download,
      success: 'PDF downloaded.',
      run: async () => {
        await downloadReceipt80G(data)
        await onDownload?.()
      },
    },
    {
      key: 'print',
      label: 'Print',
      icon: Printer,
      success: 'Print dialog opened. If nothing appeared, check your browser print settings.',
      run: () => printReceipt80G(data),
    },
    {
      key: 'email',
      label: 'Email Receipt',
      icon: Mail,
      success: `Receipt email sent to ${data.email}.`,
      run: async () => {
        await emailReceipt80G(data)
        await onEmail?.()
      },
    },
    {
      key: 'copy',
      label: 'Copy Verify Link',
      icon: Copy,
      success: 'Verification link copied.',
      run: async () => {
        if (!data.verificationUrl) throw new Error('No verification link is available for this receipt.')
        await copyReceiptVerificationLink(data)
      },
    },
    ...(onRegenerate
      ? [{
          key: 'regen',
          label: data.isReissued ? 'Reissued' : 'Regenerate',
          icon: RefreshCw,
          success: 'Receipt regenerated.',
          run: async () => {
            await onRegenerate()
          },
        }]
      : []),
  ]

  return (
    <div>
      <div className={`flex flex-wrap gap-2 ${compact ? '' : ''}`}>
        {actions.map(({ key, label, icon: Icon, run: action, success }) => (
          <button
            key={key}
            type="button"
            className={key === 'email' ? adminBtnPrimary : adminBtnSecondary}
            disabled={busy !== null}
            onClick={() => runAction(key, action, success)}
          >
            <Icon size={14} className={`mr-1.5 ${busy === key ? 'animate-spin' : ''}`} />
            {busy === key ? (busyLabel[key] ?? 'Working…') : label}
          </button>
        ))}
      </div>
      {message ? (
        <p
          role={messageTone === 'error' ? 'alert' : 'status'}
          className={`mt-2 text-sm ${messageTone === 'error' ? 'font-semibold text-red-700' : 'text-emerald-700'}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  )
}
