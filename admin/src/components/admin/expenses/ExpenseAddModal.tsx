import { useState } from 'react'
import { EXPENSE_CATEGORIES, saveExpense, updateExpenseMeta, type ExpenseCategory } from '../../../lib/expenseOperationsService'
import { adminBtnPrimary, adminBtnSecondary } from '../ui/adminStyles'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export default function ExpenseAddModal({ open, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ category: 'program' as ExpenseCategory, description: '', amount: 0, vendor: '' })
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const catLabel = EXPENSE_CATEGORIES.find((c) => c.value === form.category)?.label ?? form.category
      const expense = await saveExpense({ category: catLabel, description: form.description, amount: form.amount })
      if (form.vendor) {
        updateExpenseMeta(expense.id, { category: form.category, vendor: form.vendor, workflowStage: 'submitted' })
      }
      onSaved()
      onClose()
      setForm({ category: 'program', description: '', amount: 0, vendor: '' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" onClick={onClose} aria-label="Close" />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-[#0B2C6B]">Add Expense</h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Category</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" required>
              {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Description</span>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" required />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Vendor</span>
            <input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              placeholder="Apollo Hospital, XYZ Books…"
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Amount (₹)</span>
            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              className="w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm outline-none" required min={1} />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" className={adminBtnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" className={adminBtnPrimary} disabled={saving}>{saving ? 'Saving…' : 'Add Expense'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
