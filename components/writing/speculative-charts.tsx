'use client'

import { useId, useState } from 'react'
import data from '@/content/writing/data/speculative-agent-workloads.json'
import { Figure, Legend, SERIES, Tip, Toggle, axisText, useWidth } from './chart-kit'
import { SpeculativeTable, cellStyle, smallStyle, tableStyle } from './speculative-table'

const chartText = { ...axisText, fontSize: 12 }

type Drafter = 'ngram' | 'tiny' | 'lora' | 'dpo'
type Metric = 'alpha' | 'greedy'
type Score = { n_runs: number; n_tokens: number; alpha: number; alpha_ci95: number[]; greedy: number; greedy_ci95: number[]; coverage: number }
type Cell = { drafter: string; k: number; temp: number; status: string; n_prompts: number; accept?: number | null; tpc?: number | null }
const alpha = data.alpha as Record<Drafter, { overall: Score; by_kind: Record<string, Score> }>
const drafters: Drafter[] = ['ngram', 'tiny', 'lora', 'dpo']
const names: Record<string, string> = { ngram: 'N-gram', tiny: 'Tiny distilled', lora: 'LoRA', dpo: 'LoRA + DPO', lora_dpo: 'LoRA + DPO', base: 'Identity control', none: 'Target only' }
const colors: Record<Drafter, string> = { ngram: SERIES[1], tiny: SERIES[7], lora: SERIES[2], dpo: SERIES[0] }
const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`
const count = (v: number) => v.toLocaleString('en-US')
const selectStyle = { ...smallStyle, color: 'var(--color-ink)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 2, padding: '0.25rem 0.5rem' }

export function SpeculativeStep() {
  const [step, setStep] = useState(0)
  const copy = [
    'The drafter predicts three tokens and keeps the distribution that produced each one. The target checks the pending token and all three drafts in one call.',
    'Drafts 1 and 2 pass. Draft 3 fails, so we sample a replacement from normalized max(0, p − q).',
    'The cache keeps the accepted prefix. The replacement is committed and stays pending until the next target call; the rejected draft state is rolled back.',
  ]
  return (
    <Figure caption="A synthetic example with three drafts. These probabilities illustrate the acceptance rule." controls={['Propose', 'Verify', 'Commit'].map((label, i) => <Toggle key={label} active={step === i} onClick={() => setStep(i)}>{label}</Toggle>)}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '1rem 0' }}>
        {(step === 2 ? ['draft 1', 'draft 2', 'replacement', 'draft 3'] : ['draft 1', 'draft 2', 'draft 3']).map((label, i) => (
          <span key={label} style={{ ...smallStyle, padding: '0.4rem 0.7rem', color: 'var(--color-ink)', background: step > 0 && i < 2 ? `color-mix(in srgb, ${SERIES[2]} 12%, transparent)` : undefined, border: '1px solid var(--color-border)', textDecoration: step === 2 && i === 3 ? 'line-through' : undefined }}>
            {label}{step > 0 && i < 2 ? ' ✓' : step === 1 && i === 2 ? ' ×' : ''}
          </span>
        ))}
      </div>
      <div aria-live="polite" style={smallStyle}>{copy[step]}</div>
      <SpeculativeTable label="Example acceptance tests" headers={['Position', 'Target p(x)', 'Draft q(x)', 'Uniform u', 'u × q(x)', 'Result']} rows={[
        ['Draft 1', '0.40', '0.30', '0.60', '0.18', '0.18 < 0.40: keep'],
        ['Draft 2', '0.35', '0.40', '0.50', '0.20', '0.20 < 0.35: keep'],
        ['Draft 3', '0.12', '0.30', '0.70', '0.21', '0.21 ≥ 0.12: repair'],
      ]} />
    </Figure>
  )
}

export function SpeculativeCorpus() {
  const order = ['tool_result', 'thinking', 'tool_use', 'text', 'code']
  const labels: Record<string, string> = { tool_result: 'Tool results', thinking: 'Thinking', tool_use: 'Tool calls', text: 'Text', code: 'Fenced code' }
  const rows = data.corpus.by_kind.filter(r => r.split === 'train')
  const total = rows.reduce((sum, r) => sum + r.tokens, 0)
  return (
    <Figure caption="Training split by token count. Most tokens are thinking and tool output.">
      <div role="img" aria-label={order.map(kind => { const r = rows.find(r => r.kind === kind)!; return `${labels[kind]}: ${pct(r.tokens / total)}` }).join(', ')} style={{ display: 'flex', height: 34, margin: '0.5rem 0 1rem' }}>
        {order.map((kind, i) => { const r = rows.find(r => r.kind === kind)!; return <div key={kind} title={`${labels[kind]}: ${count(r.tokens)} tokens (${pct(r.tokens / total)})`} style={{ width: `${r.tokens / total * 100}%`, background: SERIES[i] }} /> })}
      </div>
      <Legend items={order.map((kind, i) => ({ name: `${labels[kind]} ${pct(rows.find(r => r.kind === kind)!.tokens / total)}`, color: SERIES[i] }))} />
      <SpeculativeTable label="Corpus splits" headers={['Split', 'Runs', 'Blocks', 'Tokens']} rows={[
        ...['train', 'val', 'test'].map(split => { const r = data.corpus.by_split.find(r => r.split === split)!; return [split, count(r.runs), count(r.blocks), count(r.tokens)] }),
        ['Temporal hold-out', count(data.heldout.runs), count(data.heldout.blocks), count(data.heldout.tokens)],
      ]} />
    </Figure>
  )
}

export function SpeculativeOverlap() {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<Drafter | null>(null)
  const left = width < 460 ? 100 : 138
  const x = (v: number) => left + v * (width - left - 48)
  return (
    <Figure caption="Qwen2.5-1.5B-Instruct target. All drafters use the same 700 held-out blocks, 14 runs, and 56,990 scored positions. Lines show 95% run-bootstrap intervals. Hover or focus a point to see coverage.">
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} 230`} style={{ display: 'block', width: '100%' }} role="img" aria-label="Held-out distribution overlap and 95% intervals">
          {[0, .2, .4, .6, .8, 1].map(v => <g key={v}><line x1={x(v)} x2={x(v)} y1={12} y2={188} stroke="var(--color-border)" /><text x={x(v)} y={215} textAnchor="middle" {...chartText}>{pct(v, 0)}</text></g>)}
          {drafters.map((name, i) => { const s = alpha[name].overall, y = 35 + i * 44; return (
            <g key={name} tabIndex={0} aria-label={`${names[name]} ${pct(s.alpha)}, interval ${pct(s.alpha_ci95[0])} to ${pct(s.alpha_ci95[1])}`} onMouseEnter={() => setHover(name)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(name)} onBlur={() => setHover(null)}>
              <rect x={0} y={y - 18} width={width} height={36} fill="transparent" />
              <text x={0} y={y + 4} {...chartText}>{names[name]}</text>
              <line x1={x(s.alpha_ci95[0])} x2={x(s.alpha_ci95[1])} y1={y} y2={y} stroke={colors[name]} strokeWidth={4} />
              {[s.alpha_ci95[0], s.alpha_ci95[1]].map((v, j) => <line key={j} x1={x(v)} x2={x(v)} y1={y - 6} y2={y + 6} stroke={colors[name]} />)}
              <circle cx={x(s.alpha)} cy={y} r={5} fill={colors[name]} />
              <text x={x(s.alpha) + 10} y={y + 4} {...chartText}>{pct(s.alpha)}</text>
            </g>
          ) })}
        </svg>
        {hover && <Tip x={x(alpha[hover].overall.alpha)} y={35 + drafters.indexOf(hover) * 44} width={width}>
          <div>{names[hover]}: {pct(alpha[hover].overall.alpha, 2)}</div>
          <div>95%: {pct(alpha[hover].overall.alpha_ci95[0], 2)} to {pct(alpha[hover].overall.alpha_ci95[1], 2)}</div>
          <div>Coverage: {pct(alpha[hover].overall.coverage)}</div>
        </Tip>}
      </div>
      <SpeculativeTable label="Overall overlap" headers={['Drafter', 'Overlap', '95% interval', 'Coverage']} rows={drafters.map(n => { const s = alpha[n].overall; return [names[n], pct(s.alpha, 2), `${pct(s.alpha_ci95[0], 2)} to ${pct(s.alpha_ci95[1], 2)}`, pct(s.coverage)] })} />
    </Figure>
  )
}

export function SpeculativeKinds() {
  const [metric, setMetric] = useState<Metric>('alpha')
  const [drafter, setDrafter] = useState<Drafter | 'all'>('all')
  const shown = drafter === 'all' ? drafters : [drafter]
  const kinds = [{ key: 'text', name: 'Text' }, { key: 'thinking', name: 'Thinking' }, { key: 'tool_result', name: 'Tool results' }, { key: 'tool_use:Bash', name: 'Bash calls' }, { key: 'tool_use:Edit', name: 'Edit calls' }, { key: 'tool_use:Read', name: 'Read calls' }]
  return (
    <Figure caption={<>Darker cells mean a higher estimate; 95% intervals appear below. Read calls have five supporting runs and Edit calls have four. {metric === 'greedy' && 'Greedy agreement compares the two top choices; it differs from sampled acceptance.'}</>} controls={
      <>
        <Toggle active={metric === 'alpha'} onClick={() => setMetric('alpha')}>Distribution overlap</Toggle>
        <Toggle active={metric === 'greedy'} onClick={() => setMetric('greedy')}>Greedy agreement</Toggle>
        <label style={{ ...smallStyle, display: 'flex', gap: 8, alignItems: 'center' }}>Drafter <select aria-label="Content-kind drafter" value={drafter} onChange={e => setDrafter(e.target.value as Drafter | 'all')} style={selectStyle}>
          <option value="all">All drafters</option>{drafters.map(n => <option key={n} value={n}>{names[n]}</option>)}
        </select></label>
      </>
    }>
      <div role="region" aria-label="Overlap by content kind" tabIndex={0} style={{ overflowX: 'auto' }}>
        <table aria-label="Overlap by content kind" style={{ ...tableStyle, minWidth: drafter === 'all' ? 620 : 260 }}>
          <thead><tr><th scope="col" style={cellStyle}>Content</th><th scope="col" style={cellStyle}>Support</th>{shown.map(n => <th key={n} scope="col" style={cellStyle}>{names[n]}</th>)}</tr></thead>
          <tbody>{kinds.map(kind => { const support = alpha.lora.by_kind[kind.key]; return <tr key={kind.key}>
            <th scope="row" style={{ ...cellStyle, fontWeight: 500 }}>{kind.name}</th>
            <td style={cellStyle}>{support.n_runs} runs<br /><span style={smallStyle}>{count(support.n_tokens)} positions</span></td>
            {shown.map(n => { const s = alpha[n].by_kind[kind.key], v = s[metric], ci = s[`${metric}_ci95`]; return <td key={n} style={{ ...cellStyle, textAlign: 'center', background: `color-mix(in srgb, ${colors[n]} ${(4 + v * 22).toFixed(1)}%, transparent)` }}>
              {pct(v)}<br /><span style={{ ...smallStyle, whiteSpace: 'nowrap' }}>{pct(ci[0])} to {pct(ci[1])}</span>
            </td> })}
          </tr> })}</tbody>
        </table>
      </div>
    </Figure>
  )
}

export function SpeculativeDistill() {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const standard = data.curves.distill_curve.curve, teacher = data.curves.distill_curve_tinit.curve
  const x = (v: number) => 40 + v / 1200 * (width - 60)
  const y = (v: number) => 210 - (v - 2.4) / 1.5 * 190
  return (
    <Figure caption="Validation KL across 1,200 training steps. Standard initialization: 3.788 → 2.629, a 30.6% decrease. Projected teacher embeddings finish at 2.638. These are training curves; held-out overlap is measured separately. Hover for the KL at each recorded step.">
      <div ref={ref} style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${width} 255`} style={{ width: '100%', display: 'block' }} role="img" aria-label="Distillation validation KL during training">
          {[2.5, 3, 3.5].map(v => <g key={v}><line x1={40} x2={width - 20} y1={y(v)} y2={y(v)} stroke="var(--color-border)" /><text x={32} y={y(v) + 4} textAnchor="end" {...chartText}>{v}</text></g>)}
          {[0, 300, 600, 900, 1200].map(v => <text key={v} x={x(v)} y={234} textAnchor="middle" {...chartText}>{v}</text>)}
          {[standard, teacher].map((rows, i) => <path key={i} d={rows.map((r, j) => `${j ? 'L' : 'M'}${x(r.step)},${y(r.val_kl)}`).join(' ')} stroke={SERIES[i ? 0 : 2]} strokeWidth={2.5} strokeDasharray={i ? '6 4' : undefined} fill="none" />)}
          <text x={4} y={12} {...chartText}>KL</text><text x={width - 20} y={253} textAnchor="end" {...chartText}>Training step</text>
          <rect x={40} y={15} width={width - 60} height={202} fill="transparent" onMouseMove={e => { const box = e.currentTarget.ownerSVGElement!.getBoundingClientRect(); const pos = (e.clientX - box.left) / box.width * width; const step = Math.max(0, Math.min(1200, (pos - 40) / (width - 60) * 1200)); setHover(Math.round(step / 25)) }} onMouseLeave={() => setHover(null)} />
        </svg>
        {hover !== null && <Tip x={x(standard[hover].step)} y={y(standard[hover].val_kl)} width={width}>
          <div>Step {standard[hover].step}</div><div>Standard: {standard[hover].val_kl.toFixed(3)}</div><div>Teacher init: {teacher[hover].val_kl.toFixed(3)}</div>
        </Tip>}
      </div>
      <Legend items={[{ name: 'Standard initialization', color: SERIES[2] }, { name: 'Projected teacher embeddings', color: SERIES[0] }]} />
    </Figure>
  )
}

export function SpeculativeSweep() {
  const [temperature, setTemperature] = useState(0)
  const [metric, setMetric] = useState<'tpc' | 'accept'>('tpc')
  const [partial, setPartial] = useState(false)
  const cells = data.sweep.cells as Cell[]
  return (
    <Figure caption={<>{metric === 'tpc' ? 'Tokens per step = emitted tokens / target steps.' : 'Accepted / drafted includes scored drafts after the first rejection.'} Finished cells use the same 115 prompts. Striped cells are unfinished and use different subsets; pending cells have no measurement. Target-only baselines are pending.</>} controls={
      <>
        {[0, .7].map(t => <Toggle key={t} active={temperature === t} onClick={() => setTemperature(t)}>T = {t}</Toggle>)}
        <label style={{ ...smallStyle, display: 'flex', gap: 8, alignItems: 'center' }}>Metric <select aria-label="Decoding sweep metric" value={metric} onChange={e => setMetric(e.target.value as 'tpc' | 'accept')} style={selectStyle}><option value="tpc">Tokens per target step</option><option value="accept">Accepted / drafted</option></select></label>
        <label style={{ ...smallStyle, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" checked={partial} onChange={e => setPartial(e.target.checked)} />Show partial estimates</label>
      </>
    }>
      <div role="region" aria-label="Decoding sweep" tabIndex={0} style={{ overflowX: 'auto' }}>
        <table aria-label="Decoding sweep" style={{ ...tableStyle, minWidth: 360 }}>
          <thead><tr><th scope="col" style={cellStyle}>Drafter</th>{[1, 2, 4, 8].map(k => <th key={k} scope="col" style={{ ...cellStyle, textAlign: 'center' }}>k = {k}</th>)}</tr></thead>
          <tbody>{['ngram', 'tiny', 'base', 'lora', 'lora_dpo'].map(name => <tr key={name}>
            <th scope="row" style={{ ...cellStyle, fontWeight: 500 }}>{names[name]}</th>
            {[1, 2, 4, 8].map(k => { const c = cells.find(c => c.drafter === name && c.k === k && c.temp === temperature); const pending = !c || c.status === 'pending'; const value = c?.[metric]; const show = !pending && (c.status !== 'partial' || partial); return <td key={k} style={{ ...cellStyle, textAlign: 'center', background: c?.status === 'partial' ? 'repeating-linear-gradient(135deg, transparent, transparent 7px, color-mix(in srgb, var(--color-muted) 10%, transparent) 7px, color-mix(in srgb, var(--color-muted) 10%, transparent) 14px)' : c?.status === 'complete' ? 'color-mix(in srgb, #2fae94 12%, transparent)' : undefined }}>
              {show && value != null ? metric === 'accept' ? pct(value) : value.toFixed(2) : pending ? 'Pending' : 'Partial'}
              <div style={smallStyle}>{pending ? '0 prompts' : `${c.status === 'partial' ? 'partial · ' : ''}${c.n_prompts} prompts`}</div>
            </td> })}
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ ...smallStyle, marginTop: 12 }}>26 complete · 8 partial · 8 pending · 42 configurations, including two target-only baselines<br />0.5B-Instruct target · 32 output tokens per prompt</div>
    </Figure>
  )
}

export function SpeculativeCost() {
  const [ref, width] = useWidth<HTMLDivElement>()
  const [acceptance, setAcceptance] = useState(.7)
  const [cost, setCost] = useState(.1)
  const [draftLength, setDraftLength] = useState(4)
  const id = useId()
  const expected = (k: number) => Array.from({ length: k + 1 }, (_, i) => acceptance ** i).reduce((s, v) => s + v, 0)
  const speed = (k: number) => expected(k) / (1 + k * cost)
  const values = Array.from({ length: 12 }, (_, i) => speed(i + 1))
  const best = values.indexOf(Math.max(...values)) + 1, max = Math.max(1.5, ...values) * 1.12
  const x = (k: number) => 40 + (k - 1) / 11 * (width - 60), y = (v: number) => 210 - v / max * 185
  const sliders = [
    { key: 'acceptance', label: 'Acceptance α', value: acceptance, min: 0, max: 1, step: .01, change: setAcceptance, formatted: acceptance.toFixed(2) },
    { key: 'cost', label: 'Draft / target cost c', value: cost, min: 0, max: 1, step: .01, change: setCost, formatted: cost.toFixed(2) },
    { key: 'length', label: 'Draft length k', value: draftLength, min: 1, max: 12, step: 1, change: setDraftLength, formatted: String(draftLength) },
  ]
  return (
    <Figure caption="A simplified cost model with no measured speed data. Expected tokens per call = 1 + α + α² + … + αᵏ. Relative speed = expected tokens / (1 + k × c).">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {sliders.map(s => <div key={s.key}>
          <label htmlFor={`${id}-${s.key}`} style={{ ...smallStyle, display: 'flex', justifyContent: 'space-between', gap: 10 }}>{s.label}<output htmlFor={`${id}-${s.key}`}>{s.formatted}</output></label>
          <input id={`${id}-${s.key}`} type="range" min={s.min} max={s.max} step={s.step} value={s.value} onChange={e => s.change(Number(e.target.value))} style={{ width: '100%', accentColor: SERIES[2] }} />
        </div>)}
      </div>
      <div aria-live="polite" style={{ ...smallStyle, margin: '0.75rem 0' }}><strong style={{ color: 'var(--color-ink)', fontSize: 20 }}>{speed(draftLength).toFixed(2)}×</strong> estimated relative speed · {expected(draftLength).toFixed(2)} tokens per target call · best k in this model: {best}</div>
      <div ref={ref}>
        <svg viewBox={`0 0 ${width} 260`} style={{ width: '100%', display: 'block' }} role="img" aria-label={`Cost model: acceptance ${acceptance}, draft cost ${cost}, selected draft length ${draftLength}, estimated relative speed ${speed(draftLength).toFixed(2)}`}>
          {[0, 1, 2, 4, 8, 12].filter(v => v < max).map(v => <g key={v}><line x1={40} x2={width - 20} y1={y(v)} y2={y(v)} stroke="var(--color-border)" strokeDasharray={v === 1 ? '4 4' : undefined} /><text x={32} y={y(v) + 4} textAnchor="end" {...chartText}>{v}×</text></g>)}
          {[1, 2, 4, 6, 8, 10, 12].map(v => <text key={v} x={x(v)} y={235} textAnchor="middle" {...chartText}>{v}</text>)}
          <path d={values.map((v, i) => `${i ? 'L' : 'M'}${x(i + 1)},${y(v)}`).join(' ')} fill="none" stroke={SERIES[2]} strokeWidth={2.5} />
          <circle cx={x(draftLength)} cy={y(speed(draftLength))} r={5} fill={SERIES[2]} />
          <text x={width - 20} y={256} textAnchor="end" {...chartText}>Draft length k</text>
        </svg>
      </div>
    </Figure>
  )
}

export function SpeculativeJudge() {
  return (
    <Figure caption="Corrected judge rerun, from the speculative output’s perspective. Intervals are the saved Wilson intervals; judgments in both orders are correlated.">
      {(['spec_vs_target', 'spec_vs_drafter_alone'] as const).map(key => { const j = data.judge[key]; return <div key={key} style={{ margin: '1rem 0 1.5rem' }}>
        <div style={{ ...smallStyle, color: 'var(--color-ink)', marginBottom: 8 }}>{key === 'spec_vs_target' ? 'Speculative vs target only' : 'Speculative vs drafter alone'}</div>
        <div role="img" aria-label={`${j.wins} wins, ${j.ties} ties, ${j.losses} losses across ${j.n_verdicts} verdicts`} style={{ display: 'flex', height: 34 }}>
          {[{ name: 'wins', n: j.wins, color: SERIES[2] }, { name: 'ties', n: j.ties, color: SERIES[7] }, { name: 'losses', n: j.losses, color: SERIES[6] }].filter(s => s.n).map(s => <div key={s.name} title={`${s.n} ${s.name}`} style={{ width: `${s.n / j.n_verdicts * 100}%`, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: '#071024' }}>{s.n / j.n_verdicts > .1 ? `${s.n} ${s.name}` : ''}</div>)}
        </div>
        <div style={{ ...smallStyle, marginTop: 8 }}>{j.wins} wins · {j.ties} ties · {j.losses} losses<br />{j.n_verdicts} verdicts over {j.n_prompts} prompts. Win rate: {pct(j.win_rate)}; 95% interval: {pct(j.win_ci95[0])} to {pct(j.win_ci95[1])}.<br />Both orders valid: {j.both_orders_valid} prompts; disagree: {j.both_orders_disagree}. File’s reported order disagreement: {pct(j.order_bias_disagreement)}.</div>
      </div> })}
      <Legend items={[{ name: 'Speculative wins', color: SERIES[2] }, { name: 'Tie', color: SERIES[7] }, { name: 'Speculative loses', color: SERIES[6] }]} />
    </Figure>
  )
}
