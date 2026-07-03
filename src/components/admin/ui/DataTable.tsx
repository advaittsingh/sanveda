import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  className?: string
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyFn: (row: T) => string
  onRowClick?: (row: T) => void
  selectedKey?: string
  emptyMessage?: string
  loading?: boolean
}

export default function DataTable<T>({
  columns,
  data,
  keyFn,
  onRowClick,
  selectedKey,
  emptyMessage = 'No records found.',
  loading,
}: Props<T>) {
  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8FAFC]">
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const key = keyFn(row)
              const selected = selectedKey === key
              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-[#E5E7EB]/80 transition-colors last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-[#F8FAFC]' : ''} ${selected ? 'bg-[#0B2C6B]/5' : ''}`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {!data.length && <p className="p-8 text-center text-sm text-slate-500">{emptyMessage}</p>}
    </div>
  )
}
