import type { CSSProperties, ReactNode } from 'react'

export const tableStyle: CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.6,
}
export const cellStyle: CSSProperties = {
  padding: '0.65rem 0.5rem', borderBottom: '1px solid var(--color-border)', textAlign: 'left', verticalAlign: 'top',
}
export const smallStyle: CSSProperties = { fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.6, color: 'var(--color-muted)' }

export function SpeculativeTable({ label, headers, rows }: { label: string; headers: string[]; rows: ReactNode[][] }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} style={{ overflowX: 'auto', margin: '1rem 0' }}>
      <table aria-label={label} style={{ ...tableStyle, minWidth: 520 }}>
        <thead><tr>{headers.map(h => <th key={h} scope="col" style={{ ...cellStyle, color: 'var(--color-muted)', fontWeight: 500 }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0
          ? <th key={j} scope="row" style={{ ...cellStyle, fontWeight: 500 }}>{cell}</th>
          : <td key={j} style={cellStyle}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  )
}
