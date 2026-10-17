'use client'

import { useState } from 'react'
import data from '@/content/writing/data/loopgym.json'
import { Figure, Legend, SERIES, Tip, Toggle, axisText, useWidth } from './chart-kit'
import { cellStyle, tableStyle } from './speculative-table'

type Run = 'grpo15' | 'grpo05'
type Step = { step: number; reward: number; nosignal: number; kl: number; step_s: number }
type Eval = { model: string; arm: string; split: string; pass: number; ci: number[]; n: number; n_tasks: number }

const chartText = { ...axisText, fontSize: 12 }
const runs = data.runs as Record<Run, { label: string; steps: Step[]; evals: { step: number; reward: number; tasks: number }[] }>
const evals = data.evals as Eval[]
const pct = (v: number) => `${(v * 100).toFixed(0)}%`

function rolling(vals: number[], w: number) {
  return vals.map((_, i) => { const s = vals.slice(Math.max(0, i - w + 1), i + 1); return s.reduce((a, b) => a + b, 0) / s.length })
}

export function LoopgymTraining() {
  const [run, setRun] = useState<Run>('grpo15')
  const [metric, setMetric] = useState<'reward' | 'nosignal'>('reward')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const r = runs[run], steps = r.steps, last = steps[steps.length - 1].step
  const vals = steps.map(s => s[metric]), smooth = rolling(vals, 10)
  const left = 40, right = 16, top = 12, h = 200
  const x = (s: number) => left + (s - 1) / Math.max(1, last - 1) * (width - left - right)
  const y = (v: number) => top + (1 - v) * h
  const color = metric === 'reward' ? SERIES[0] : SERIES[1]
  const pick = (px: number) => { const s = Math.round(1 + (px - left) / (width - left - right) * (last - 1)); return Math.min(steps.length - 1, Math.max(0, s - 1)) }
  return (
    <Figure caption={<>{metric === 'reward'
      ? 'Mean reward per GRPO step (share of the 32 sampled solutions that pass their hidden tests). Dots: each step. Line: 10-step mean. Diamonds: held-out validation check every 20 steps (8 tasks, different ones each time, so they are noisy).'
      : 'Share of groups where all 8 samples got the same reward. Those groups have zero advantage, so they contribute nothing to the gradient. Dots: each step. Line: 10-step mean.'} Hover for a step.</>} controls={<>
        <Toggle active={run === 'grpo15'} onClick={() => setRun('grpo15')}>1.5B on GPUs</Toggle>
        <Toggle active={run === 'grpo05'} onClick={() => setRun('grpo05')}>0.5B on CPU</Toggle>
        <span style={{ width: 8 }} />
        <Toggle active={metric === 'reward'} onClick={() => setMetric('reward')}>Reward</Toggle>
        <Toggle active={metric === 'nosignal'} onClick={() => setMetric('nosignal')}>Groups with no signal</Toggle>
      </>}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${h + 44}`} style={{ display: 'block', width: '100%' }} role="img"
          aria-label={`${r.label}: ${metric} ${pct(smooth[9] ?? smooth[0])} after 10 steps, ${pct(smooth[smooth.length - 1])} at the end (10-step mean)`}
          onMouseMove={e => { const b = (e.currentTarget as SVGSVGElement).getBoundingClientRect(); setHover(pick((e.clientX - b.left) / b.width * width)) }}
          onMouseLeave={() => setHover(null)}>
          {[0, .25, .5, .75, 1].map(v => <g key={v}><line x1={left} x2={width - right} y1={y(v)} y2={y(v)} stroke="var(--color-border)" /><text x={left - 6} y={y(v) + 4} textAnchor="end" {...axisText}>{pct(v)}</text></g>)}
          {[1, ...Array.from({ length: Math.floor(last / 20) }, (_, i) => (i + 1) * 20)].map(s => <text key={s} x={x(s)} y={h + top + 18} textAnchor="middle" {...axisText}>{s}</text>)}
          <text x={(width + left) / 2} y={h + top + 32} textAnchor="middle" {...axisText}>GRPO step</text>
          {steps.map((s, i) => <circle key={s.step} cx={x(s.step)} cy={y(vals[i])} r={2.5} fill={color} opacity={.35} />)}
          <path d={smooth.map((v, i) => `${i ? 'L' : 'M'}${x(steps[i].step)},${y(v)}`).join(' ')} fill="none" stroke={color} strokeWidth={2} />
          {metric === 'reward' && r.evals.map(e => <rect key={e.step} x={x(e.step) - 5} y={y(e.reward) - 5} width={10} height={10} transform={`rotate(45 ${x(e.step)} ${y(e.reward)})`} fill={SERIES[2]} stroke="var(--color-bg)" strokeWidth={2} />)}
          {hover !== null && <line x1={x(steps[hover].step)} x2={x(steps[hover].step)} y1={top} y2={top + h} stroke="var(--color-muted)" strokeDasharray="3 3" />}
        </svg>
        {hover !== null && (() => { const s = steps[hover], ev = r.evals.find(e => e.step === s.step); return <Tip x={x(s.step)} y={y(vals[hover])} width={width}>
          <strong>step {s.step}</strong><br />reward {pct(s.reward)} · 10-step mean {pct(smooth[hover])}<br />no-signal groups {pct(s.nosignal)}<br />KL {s.kl.toExponential(1)} · {(s.step_s / 60).toFixed(1)} min{ev && <><br />validation check {pct(ev.reward)}</>}
        </Tip> })()}
      </div>
      <Legend items={metric === 'reward'
        ? [{ name: 'training reward', color }, { name: 'validation check (8 tasks)', color: SERIES[2] }]
        : [{ name: 'groups with no signal', color }]} />
    </Figure>
  )
}

export function LoopgymPassAt1() {
  const [split, setSplit] = useState<'val' | 'loopgym'>('val')
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const rows = ['0.5B', '1.5B'].flatMap(m => ['base', 'grpo'].map(a => evals.find(e => e.model === m && e.arm === a && e.split === split)))
    .filter((e): e is Eval => !!e)
  const hi = Math.max(.25, ...rows.map(r => r.ci[1])) + .05
  const left = width < 460 ? 128 : 140
  const x = (v: number) => left + v / hi * (width - left - 20)
  const name = (e: Eval) => `${e.model} ${e.arm === 'base' ? 'base' : 'after GRPO'}`
  const tickVals = [0, .1, .2, .3, .4, .5, .6].filter(v => v <= hi)
  return (
    <Figure caption={<>{split === 'val'
      ? 'Exercism validation tasks (9 exercises, hidden tests). pass@1 at temperature 0.8, 512 new tokens.'
      : 'LoopGYM tasks: 13 held-out bugs that agents actually shipped, each verified to fail before the fix and pass after.'} Dot: pass@1. Line: 95% bootstrap interval over tasks. Hover a row for the sample count.</>} controls={<>
        <Toggle active={split === 'val'} onClick={() => setSplit('val')}>Exercism</Toggle>
        <Toggle active={split === 'loopgym'} onClick={() => setSplit('loopgym')}>Real agent bugs</Toggle>
      </>}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${rows.length * 42 + 46}`} style={{ display: 'block', width: '100%' }} role="img" aria-label={rows.map(r => `${name(r)} ${pct(r.pass)} (${pct(r.ci[0])} to ${pct(r.ci[1])})`).join(', ')}>
          {tickVals.map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={8} y2={rows.length * 42 + 14} stroke="var(--color-border)" /><text x={x(v)} y={rows.length * 42 + 32} textAnchor="middle" {...axisText}>{pct(v)}</text></g>)}
          {rows.map((r, i) => { const y = 30 + i * 42, c = r.arm === 'base' ? SERIES[7] : SERIES[0]; return (
            <g key={name(r)} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <rect x={0} y={y - 19} width={width} height={38} fill="transparent" />
              <text x={0} y={y + 4} {...chartText}>{name(r)}</text>
              <line x1={x(r.ci[0])} x2={x(r.ci[1])} y1={y} y2={y} stroke={c} strokeWidth={2} strokeLinecap="round" />
              <circle cx={x(r.pass)} cy={y} r={hover === i ? 6 : 5} fill={c} stroke="var(--color-bg)" strokeWidth={2} />
            </g>) })}
        </svg>
        {hover !== null && (() => { const r = rows[hover]; return <Tip x={x(r.pass)} y={30 + hover * 42} width={width}>
          <strong>{name(r)}</strong><br />pass@1 {(r.pass * 100).toFixed(1)}%<br />95% CI [{(r.ci[0] * 100).toFixed(1)}%, {(r.ci[1] * 100).toFixed(1)}%]<br />{r.n} samples × {r.n_tasks} tasks
        </Tip> })()}
      </div>
      <Legend items={[{ name: 'base model', color: SERIES[7] }, { name: 'after GRPO (LoRA)', color: SERIES[0] }]} />
    </Figure>
  )
}

const kernelNames: Record<string, string> = { naive: 'naive (full logits)', torch: 'chunked PyTorch', cpp: 'fused C++ kernel' }
const kernelShort: Record<string, string> = { naive: 'naive', torch: 'chunked', cpp: 'fused C++' }
const fmtBytes = (b: number) => b >= 1e9 ? `${(b / 1e9).toFixed(2)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(0)} MB` : `${(b / 1e3).toFixed(0)} KB`

export function LoopgymKernel() {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const cells = data.kernel.cells
  const narrow = width < 460, left = narrow ? 84 : 170, lo = 4, hi = 10  // log10 bytes: 10 KB .. 10 GB
  const x = (b: number) => left + (Math.log10(b) - lo) / (hi - lo) * (width - left - 70)
  return (
    <Figure caption={<>Extra memory to get the log-prob of every token in one 2,048-token sequence over Qwen&apos;s {data.kernel.V.toLocaleString('en-US')}-token vocabulary (CPU, fp32). Log scale. Every version matches a float64 reference to within 1e-4. Hover a bar for the run time.</>}>
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} ${cells.length * 40 + 40}`} style={{ display: 'block', width: '100%' }} role="img" aria-label={cells.map(c => `${kernelNames[c.impl]}: ${fmtBytes(c.peak_bytes)}`).join(', ')}>
          {[4, 6, 8, 10].map(p => <g key={p}><line x1={x(10 ** p)} x2={x(10 ** p)} y1={6} y2={cells.length * 40 + 12} stroke="var(--color-border)" /><text x={x(10 ** p)} y={cells.length * 40 + 28} textAnchor="middle" {...axisText}>{fmtBytes(10 ** p).replace('.00', '')}</text></g>)}
          {cells.map((c, i) => { const y = 14 + i * 40; return (
            <g key={c.impl} tabIndex={0} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <rect x={0} y={y - 6} width={width} height={36} fill="transparent" />
              <text x={0} y={y + 16} {...chartText}>{(narrow ? kernelShort : kernelNames)[c.impl]}</text>
              <rect x={left} y={y} width={Math.max(2, x(c.peak_bytes) - left)} height={24} rx={4} fill={SERIES[[6, 3, 2][i]]} opacity={hover === null || hover === i ? 1 : .6} />
              <text x={x(c.peak_bytes) + 6} y={y + 16} {...chartText}>{fmtBytes(c.peak_bytes)}</text>
            </g>) })}
        </svg>
        {hover !== null && (() => { const c = cells[hover]; return <Tip x={x(c.peak_bytes)} y={14 + hover * 40} width={width}>
          <strong>{kernelNames[c.impl]}</strong><br />{fmtBytes(c.peak_bytes)} extra · {c.time_s.toFixed(2)} s median
        </Tip> })()}
      </div>
      <table aria-label="Log-prob kernels" style={{ ...tableStyle, margin: '1rem 0' }}>
        <thead><tr>{['Version', narrow ? 'Memory' : 'Extra memory', narrow ? 'Time' : 'Time (CPU)'].map(h => <th key={h} scope="col" style={{ ...cellStyle, color: 'var(--color-muted)', fontWeight: 500 }}>{h}</th>)}</tr></thead>
        <tbody>{cells.map(c => <tr key={c.impl}><th scope="row" style={{ ...cellStyle, fontWeight: 500 }}>{(narrow ? kernelShort : kernelNames)[c.impl]}</th><td style={cellStyle}>{fmtBytes(c.peak_bytes)}</td><td style={cellStyle}>{c.time_s.toFixed(2)} s</td></tr>)}</tbody>
      </table>
    </Figure>
  )
}
