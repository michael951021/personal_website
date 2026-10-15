'use client'

import { useState } from 'react'
import data from '@/content/writing/data/mem-vs-ft-ctf.json'
import { Figure, Legend, SERIES, Tip, Toggle, axisText, useWidth } from './chart-kit'
import { SpeculativeTable as Table } from './speculative-table'

type Point = { mean: number; ci95: number[]; n: number }
type Regime = '27b' | '7b'
type Split = 'test-indist' | 'test-transfer'

const chartText = { ...axisText, fontSize: 12 }
const ARMS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
const colors: Record<string, string> = { A: SERIES[7], B: SERIES[1], C: SERIES[0], D: SERIES[2], E: SERIES[3], F: SERIES[4] }
const names: Record<string, string> = { A: 'A no memory', B: 'B raw examples', C: 'C episodic retrieval', D: 'D playbook', E: 'E QLoRA weights', F: 'F weights + playbook' }
const turns = data.pilot27b.turns_saved as Record<string, Point>
const advantage = data.h3.advantage as Record<string, Point>
const success = data.h3.success as Record<string, { rate: number; n: number }>
const signed = (v: number, d = 2) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d)}`

export function MemRegimes() {
  const [regime, setRegime] = useState<Regime>('27b')
  const [split, setSplit] = useState<Split>('test-indist')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const rows = regime === '27b'
    ? ['B', 'C', 'D'].map(a => ({ arm: a, ...turns[`${a}|${split}`] }))
    : ['B', 'C', 'D', 'E', 'F'].map(a => ({ arm: a, ...advantage[a] }))
  const [lo, hi] = regime === '27b' ? [-1, 2] : [-.6, 1]
  const left = width < 460 ? 130 : 170
  const x = (v: number) => left + (v - lo) / (hi - lo) * (width - left - 20)
  const tickVals = regime === '27b' ? [-1, -.5, 0, .5, 1, 1.5, 2] : [-.6, -.4, -.2, 0, .2, .4, .6, .8, 1]
  const unit = regime === '27b' ? 'turns saved vs A' : 'success rate minus A'
  return (
    <Figure caption={<>{regime === '27b'
      ? 'Resident 27B base, where every arm solves every challenge: turns saved vs no memory on challenges both solved. 3 seeds, 15 paired attempts per arm.'
      : 'Matched 7B base, which fails some tasks: success rate minus no memory, in-distribution test split. A–D have 2 seeds (n = 10), E/F have 1 (n = 5).'} Dot: estimate. Line: 95% bootstrap interval over the 5 challenge families. Hover a row.</>} controls={<>
        <Toggle active={regime === '27b'} onClick={() => setRegime('27b')}>27B base</Toggle>
        <Toggle active={regime === '7b'} onClick={() => setRegime('7b')}>7B base</Toggle>
        {regime === '27b' && <>{(['test-indist', 'test-transfer'] as Split[]).map(s => <Toggle key={s} active={split === s} onClick={() => setSplit(s)}>{s === 'test-indist' ? 'Same family' : 'Sibling family'}</Toggle>)}</>}
      </>}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${rows.length * 42 + 46}`} style={{ display: 'block', width: '100%' }} role="img" aria-label={rows.map(r => `${names[r.arm]} ${signed(r.mean)} (${signed(r.ci95[0])} to ${signed(r.ci95[1])})`).join(', ')}>
          {tickVals.map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={8} y2={rows.length * 42 + 14} stroke="var(--color-border)" strokeDasharray={v === 0 ? '4 4' : undefined} /><text x={x(v)} y={rows.length * 42 + 32} textAnchor="middle" {...axisText}>{v}</text></g>)}
          {rows.map((r, i) => { const y = 30 + i * 42; return (
            <g key={r.arm} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <rect x={0} y={y - 19} width={width} height={38} fill="transparent" />
              <text x={0} y={y + 4} {...chartText}>{names[r.arm]}</text>
              <line x1={x(r.ci95[0])} x2={x(r.ci95[1])} y1={y} y2={y} stroke={colors[r.arm]} strokeWidth={2} strokeLinecap="round" />
              <circle cx={x(r.mean)} cy={y} r={hover === i ? 6 : 5} fill={colors[r.arm]} stroke="var(--color-bg)" strokeWidth={2} />
            </g>) })}
        </svg>
        {hover !== null && (() => { const r = rows[hover]; return <Tip x={x(r.mean)} y={30 + hover * 42} width={width}>
          <strong>{names[r.arm]}</strong><br />{signed(r.mean)} {unit}<br />95% CI [{signed(r.ci95[0])}, {signed(r.ci95[1])}] · {r.n} pairs
        </Tip> })()}
      </div>
      <div style={{ ...axisText, fontSize: 'var(--text-xs)', marginTop: 4 }}>x-axis: {unit}</div>
    </Figure>
  )
}

export function MemSuccess() {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<string | null>(null)
  const splits: Split[] = ['test-indist', 'test-transfer']
  const group = (width - 40) / ARMS.length, bar = Math.min(26, group / 3)
  const y = (v: number) => 190 - v * 170
  return (
    <Figure caption="Matched 7B base: share of challenges solved per arm. Solid bars: same-family test challenges. Faded bars: sibling challenges (same mechanism, different surface). Hover a bar for n.">
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} 230`} style={{ display: 'block', width: '100%' }} role="img" aria-label={ARMS.map(a => `${names[a]}: ${splits.map(s => `${s} ${success[`${a}|${s}`]?.rate}`).join(', ')}`).join('; ')}>
          {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1={34} x2={width} y1={y(v)} y2={y(v)} stroke="var(--color-border)" /><text x={28} y={y(v) + 4} textAnchor="end" {...axisText}>{v * 100}%</text></g>)}
          {ARMS.map((a, i) => <g key={a}>
            {splits.map((s, j) => { const c = success[`${a}|${s}`]; if (!c) return null; const bx = 40 + i * group + group / 2 - bar - 1 + j * (bar + 2); const key = `${a}|${s}`; return (
              <rect key={s} x={bx} y={y(c.rate)} width={bar} height={Math.max(0, y(0) - y(c.rate))} rx={3} fill={colors[a]} opacity={(j ? .45 : 1) * (hover === null || hover === key ? 1 : .6)} tabIndex={0}
                onMouseEnter={() => setHover(key)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(key)} onBlur={() => setHover(null)} />) })}
            <text x={40 + i * group + group / 2} y={214} textAnchor="middle" {...chartText}>{a}</text>
          </g>)}
        </svg>
        {hover && (() => { const [a, s] = hover.split('|'), c = success[hover], i = ARMS.indexOf(a as typeof ARMS[number]); return <Tip x={40 + i * group + group / 2} y={y(c.rate)} width={width}>
          <strong>{names[a]}</strong><br />{s === 'test-indist' ? 'same family' : 'sibling family'}: {(c.rate * 100).toFixed(0)}% of {c.n}
        </Tip> })()}
      </div>
      <Legend items={ARMS.map(a => ({ name: names[a], color: colors[a] }))} />
      <Table label="Success by arm" headers={['Arm', 'Same family', 'Sibling family']} rows={ARMS.map(a => [names[a], ...splits.map(s => { const c = success[`${a}|${s}`]; return c ? `${(c.rate * 100).toFixed(0)}% (n = ${c.n})` : '—' })])} />
    </Figure>
  )
}
