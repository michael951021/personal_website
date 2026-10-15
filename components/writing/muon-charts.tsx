'use client'

import { useState } from 'react'
import data from '@/content/writing/data/muon-dual3090.json'
import { Figure, Legend, SERIES, Tip, Toggle, axisText, useWidth } from './chart-kit'
import { SpeculativeTable as Table } from './speculative-table'

type Task = 'cifar' | 'language'
type Paired = { mean: number; ci95: number[] | null }
type Confirm = { arm: string; precision: string; lr: number; steps: number; mean_test_loss: number; sd_test_loss: number; mean_test_accuracy: number; mean_seconds: number; vs_keller: Paired; vs_svd: Paired }
type Spectrum = { task: string; arm: string; precision: string; p0: number; p25: number; p50: number; p75: number; p100: number; below_sigma_min: number }
type Cell = { task: string; arm: string; precision: string; lr: number; mean_validation_loss: number | null; diverged: number }

const chartText = { ...axisText, fontSize: 12 }
const colors: Record<string, string> = { keller: SERIES[0], 'gamma_0.20': SERIES[1], exact_svd: SERIES[2] }
const names: Record<string, string> = { keller: 'Keller', 'gamma_0.20': 'γ = 0.20 fit', exact_svd: 'Exact SVD' }
const taskNames: Record<Task, string> = { cifar: 'CIFAR-10 CNN', language: '124M GPT' }
const confirm = data.confirm as Record<Task, Confirm[]>
const signed = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(4)}`

function TaskToggle({ task, setTask }: { task: Task; setTask: (t: Task) => void }) {
  return <>{(['cifar', 'language'] as Task[]).map(t => <Toggle key={t} active={task === t} onClick={() => setTask(t)}>{taskNames[t]}</Toggle>)}</>
}

export function MuonPaired() {
  const [task, setTask] = useState<Task>('cifar')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const rows = confirm[task].filter(r => r.arm !== 'keller')
  const span = Math.max(...rows.flatMap(r => (r.vs_keller.ci95 ?? [0, 0]).map(Math.abs))) * 1.15
  const left = width < 460 ? 120 : 160
  const x = (v: number) => left + (v + span) / (2 * span) * (width - left - 20)
  const tick = span > 0.01 ? 0.005 : 0.002
  const ticks = Array.from({ length: 2 * Math.floor(span / tick) + 1 }, (_, i) => (i - Math.floor(span / tick)) * tick)
  return (
    <Figure caption="Test loss minus Keller's, paired by seed (3 fresh seeds) at the same precision. Dot: mean. Line: 95% t-interval. Left of the dashed line beats Keller. Hover a row for the numbers." controls={<TaskToggle task={task} setTask={setTask} />}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${rows.length * 44 + 44}`} style={{ display: 'block', width: '100%' }} role="img" aria-label={rows.map(r => `${names[r.arm]} ${r.precision}: ${signed(r.vs_keller.mean)}`).join(', ')}>
          {ticks.map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={8} y2={rows.length * 44 + 14} stroke="var(--color-border)" strokeDasharray={Math.abs(v) < 1e-12 ? '4 4' : undefined} /><text x={x(v)} y={rows.length * 44 + 32} textAnchor="middle" {...axisText}>{v === 0 ? '0' : v.toFixed(3)}</text></g>)}
          {rows.map((r, i) => { const y = 30 + i * 44, [lo, hi] = r.vs_keller.ci95 ?? [r.vs_keller.mean, r.vs_keller.mean]; return (
            <g key={i} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <rect x={0} y={y - 20} width={width} height={40} fill="transparent" />
              <text x={0} y={y + 4} {...chartText}>{names[r.arm]} {r.precision}</text>
              <line x1={x(lo)} x2={x(hi)} y1={y} y2={y} stroke={colors[r.arm]} strokeWidth={2} strokeLinecap="round" />
              <circle cx={x(r.vs_keller.mean)} cy={y} r={hover === i ? 6 : 5} fill={colors[r.arm]} stroke="var(--color-bg)" strokeWidth={2} />
            </g>) })}
        </svg>
        {hover !== null && (() => { const r = rows[hover], [lo, hi] = r.vs_keller.ci95 ?? [0, 0]; return <Tip x={x(r.vs_keller.mean)} y={30 + hover * 44} width={width}>
          <strong>{names[r.arm]} {r.precision}</strong><br />vs Keller {signed(r.vs_keller.mean)} [{signed(lo)}, {signed(hi)}]<br />test loss {r.mean_test_loss.toFixed(4)} · accuracy {(r.mean_test_accuracy * 100).toFixed(1)}%<br />lr {r.lr} · {r.steps.toLocaleString('en-US')} steps
        </Tip> })()}
      </div>
      <Table label="Confirmation results" headers={['Arm', 'Test loss', 'Accuracy', 'vs Keller (95% CI)', 'Seconds / run']} rows={confirm[task].map(r => [`${names[r.arm]} ${r.precision}`, r.mean_test_loss.toFixed(4), `${(r.mean_test_accuracy * 100).toFixed(1)}%`, r.arm === 'keller' ? '—' : `${signed(r.vs_keller.mean)} [${signed(r.vs_keller.ci95![0])}, ${signed(r.vs_keller.ci95![1])}]`, Math.round(r.mean_seconds).toLocaleString('en-US')])} />
    </Figure>
  )
}

export function MuonSpectra() {
  const [task, setTask] = useState<Task>('language')
  const [precision, setPrecision] = useState<'fp32' | 'bf16'>('fp32')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const rows = (data.spectra as Spectrum[]).filter(s => s.task === task && s.precision === precision)
    .sort((a, b) => ['exact_svd', 'gamma_0.20', 'keller'].indexOf(a.arm) - ['exact_svd', 'gamma_0.20', 'keller'].indexOf(b.arm))
  const left = width < 460 ? 90 : 120
  const x = (v: number) => left + v / 1.35 * (width - left - 20)
  return (
    <Figure caption="Singular values of the update the optimizer actually applied, logged during the confirmation runs. Thick: middle 50%. Thin: min to max. Tick: median. The share below σ_min is the part of the spectrum the polynomial never pulls into its band." controls={<><TaskToggle task={task} setTask={setTask} />{(['fp32', 'bf16'] as const).map(p => <Toggle key={p} active={precision === p} onClick={() => setPrecision(p)}>{p}</Toggle>)}</>}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${rows.length * 44 + 44}`} style={{ display: 'block', width: '100%' }} role="img" aria-label={rows.map(r => `${names[r.arm]}: middle half ${r.p25.toFixed(2)} to ${r.p75.toFixed(2)}, max ${r.p100.toFixed(2)}`).join(', ')}>
          {[0, .2, .4, .6, .8, 1, 1.2].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={8} y2={rows.length * 44 + 14} stroke="var(--color-border)" strokeDasharray={v === 1 ? '4 4' : undefined} /><text x={x(v)} y={rows.length * 44 + 32} textAnchor="middle" {...axisText}>{v.toFixed(1)}</text></g>)}
          {rows.map((r, i) => { const y = 30 + i * 44, flat = r.p75 - r.p25 < .01; return (
            <g key={r.arm} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <rect x={0} y={y - 20} width={width} height={40} fill="transparent" />
              <text x={0} y={y + 4} {...chartText}>{names[r.arm]}</text>
              <line x1={x(r.p0)} x2={x(r.p100)} y1={y} y2={y} stroke={colors[r.arm]} strokeWidth={2} opacity={.55} />
              {flat ? <rect x={x(r.p50) - 5} y={y - 5} width={10} height={10} transform={`rotate(45 ${x(r.p50)} ${y})`} fill={colors[r.arm]} />
                : <><rect x={x(r.p25)} y={y - 7} width={x(r.p75) - x(r.p25)} height={14} rx={4} fill={colors[r.arm]} /><line x1={x(r.p50)} x2={x(r.p50)} y1={y - 7} y2={y + 7} stroke="var(--color-bg)" strokeWidth={2} /></>}
            </g>) })}
        </svg>
        {hover !== null && (() => { const r = rows[hover]; return <Tip x={x(r.p75)} y={30 + hover * 44} width={width}>
          <strong>{names[r.arm]} {precision}</strong><br />min {r.p0.toFixed(3)} · median {r.p50.toFixed(3)} · max {r.p100.toFixed(3)}<br />middle 50%: {r.p25.toFixed(3)}–{r.p75.toFixed(3)}<br />below σ_min: {(r.below_sigma_min * 100).toFixed(1)}%
        </Tip> })()}
      </div>
      <Legend items={rows.map(r => ({ name: `${names[r.arm]} · ${(r.below_sigma_min * 100).toFixed(0)}% below σ_min`, color: colors[r.arm] }))} />
    </Figure>
  )
}

export function MuonTuning() {
  const [task, setTask] = useState<Task>('cifar')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<string | null>(null)
  const lrs = [0.005, 0.02, 0.08]
  const arms = ['keller', 'gamma_0.20', 'exact_svd']
  const cells = (data.tuning as Cell[]).filter(c => c.task === task && c.precision === 'fp32' && arms.includes(c.arm))
  const values = cells.map(c => c.mean_validation_loss!).filter(v => v != null)
  const lo = Math.min(...values), hi = Math.max(...values), pad = (hi - lo) * .12
  const x = (i: number) => 56 + i / 2 * (width - 90)
  const y = (v: number) => 16 + (hi + pad - v) / (hi - lo + 2 * pad) * 190
  const yTicks = Array.from({ length: 5 }, (_, i) => lo - pad + (i + .5) * (hi - lo + 2 * pad) / 5)
  return (
    <Figure caption={<>Mean validation loss on the tuning seeds, fp32 arms. {task === 'cifar' ? 'Every arm is still improving at the largest rate tried.' : 'Every arm is best at the smallest rate tried.'} The best rate is likely off the grid, so the comparison happens at a rate that is equally off for every arm.</>} controls={<TaskToggle task={task} setTask={setTask} />}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} 240`} style={{ display: 'block', width: '100%' }} role="img" aria-label={arms.map(a => `${names[a]}: ${lrs.map(lr => cells.find(c => c.arm === a && c.lr === lr)?.mean_validation_loss?.toFixed(3)).join(', ')}`).join('; ')}>
          {yTicks.map(v => <g key={v}><line x1={50} x2={width - 20} y1={y(v)} y2={y(v)} stroke="var(--color-border)" /><text x={44} y={y(v) + 4} textAnchor="end" {...axisText}>{v.toFixed(task === 'cifar' ? 3 : 2)}</text></g>)}
          {lrs.map((lr, i) => <text key={lr} x={x(i)} y={230} textAnchor="middle" {...chartText}>lr {lr}</text>)}
          {arms.map(arm => { const pts = lrs.map((lr, i) => ({ i, lr, v: cells.find(c => c.arm === arm && c.lr === lr)?.mean_validation_loss })); return (
            <g key={arm} opacity={hover === null || hover === arm ? 1 : .35} onMouseEnter={() => setHover(arm)} onMouseLeave={() => setHover(null)}>
              <path d={pts.map((p, j) => `${j ? 'L' : 'M'}${x(p.i)},${y(p.v!)}`).join(' ')} fill="none" stroke={colors[arm]} strokeWidth={2} />
              {pts.map(p => <circle key={p.lr} cx={x(p.i)} cy={y(p.v!)} r={5} fill={colors[arm]} stroke="var(--color-bg)" strokeWidth={2} />)}
            </g>) })}
        </svg>
        {hover && <Tip x={x(1)} y={20} width={width}><strong>{names[hover]}</strong><br />{lrs.map(lr => `lr ${lr}: ${cells.find(c => c.arm === hover && c.lr === lr)?.mean_validation_loss?.toFixed(4)}`).map(t => <span key={t}>{t}<br /></span>)}</Tip>}
      </div>
      <Legend items={arms.map(a => ({ name: names[a], color: colors[a] }))} />
    </Figure>
  )
}
