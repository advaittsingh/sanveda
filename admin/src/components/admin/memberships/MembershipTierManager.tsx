import { useState } from 'react'
import { Pencil, Save } from 'lucide-react'
import AdminCard from '../ui/AdminCard'
import { adminBtnPrimary, adminBtnSecondary, adminInputClass } from '../ui/adminStyles'
import {
  formatTierPriceDisplay,
  saveTierConfigs,
  type MembershipTierConfig,
} from '../../../lib/membershipOperationsService'

interface Props {
  tiers: MembershipTierConfig[]
  onSaved: () => void
}

export default function MembershipTierManager({ tiers, onSaved }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(tiers)

  const startEdit = () => {
    setDraft(tiers)
    setEditing(true)
  }

  const save = () => {
    saveTierConfigs(draft)
    setEditing(false)
    onSaved()
  }

  const updateTier = (index: number, patch: Partial<MembershipTierConfig>) => {
    setDraft((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)))
  }

  const updateBenefit = (tierIndex: number, benefitIndex: number, text: string) => {
    setDraft((prev) =>
      prev.map((t, i) =>
        i === tierIndex
          ? { ...t, benefits: t.benefits.map((b, j) => (j === benefitIndex ? { text } : b)) }
          : t,
      ),
    )
  }

  return (
    <AdminCard>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#0B2C6B]">Membership Tiers</h3>
          <p className="text-sm text-slate-500">Configure pricing, benefits, and validity</p>
        </div>
        {editing ? (
          <button type="button" className={adminBtnPrimary} onClick={save}>
            <Save size={14} className="mr-1.5" />
            Save Tiers
          </button>
        ) : (
          <button type="button" className={adminBtnSecondary} onClick={startEdit}>
            <Pencil size={14} className="mr-1.5" />
            Edit Tiers
          </button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(editing ? draft : tiers).map((tier, tierIndex) => (
          <div key={tier.id} className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
            {editing ? (
              <>
                <input
                  className={`${adminInputClass} mb-2 font-semibold`}
                  value={tier.name}
                  onChange={(e) => updateTier(tierIndex, { name: e.target.value })}
                />
                <div className="mb-3 flex gap-2">
                  <input
                    type="number"
                    className={adminInputClass}
                    value={tier.price}
                    onChange={(e) => updateTier(tierIndex, { price: Number(e.target.value) })}
                    placeholder="Price"
                  />
                  <input
                    type="number"
                    className={adminInputClass}
                    value={tier.validityMonths ?? ''}
                    onChange={(e) =>
                      updateTier(tierIndex, {
                        validityMonths: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    placeholder="Months"
                  />
                </div>
                <ul className="space-y-1">
                  {tier.benefits.map((b, bi) => (
                    <li key={bi}>
                      <input
                        className={`${adminInputClass} text-xs`}
                        value={b.text}
                        onChange={(e) => updateBenefit(tierIndex, bi, e.target.value)}
                      />
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-[#0B2C6B]">{tier.name}</h4>
                <p className="mt-1 text-lg font-bold text-[#0E4FA8]">
                  {formatTierPriceDisplay(tier)}
                </p>
                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {tier.benefits.map((b) => (
                    <li key={b.text}>✓ {b.text}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
    </AdminCard>
  )
}
