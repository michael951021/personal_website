'use client'

// Interactive figures for "Local Multi-Agent Loop". Data: content/writing/data/local-multi-agent-loop.json,
// exported from the loop's own reports by scripts/export_loop_study.py.
import { Children, isValidElement, useState } from 'react'
import data from '@/content/writing/data/local-multi-agent-loop.json'
import { SERIES, Figure, Legend, Tip, Toggle, axisText, k, ticks, useWidth } from './chart-kit'

type Cat = { key: string; name: string }
const CATS = data.cats as Cat[]
const catColor = (key: string) => SERIES[CATS.findIndex(c => c.key === key) % SERIES.length]
const hourLabel = (t: number) => {
  const d = new Date(t * 1000)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }) + ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', timeZone: 'America/New_York' })
}
const agentName = (tag: string) => (tag.endsWith('/w1') ? 'agent 1' : tag.endsWith('/w2') ? 'agent 2' : 'single agent (Ollama)')
const hm = (s: number) => (s >= 3600 ? `${(s / 3600).toFixed(1)} h` : `${Math.round(s / 60)} min`)

const PAD = { l: 44, r: 10, t: 12, b: 24 }

// ── context over one run, or what grew the context over all runs ──────────────────────────────────

export function ContextChart() {
  const [mode, setMode] = useState<'run' | 'all'>('run')
  return (
    <Figure
      controls={
        <>
          <Toggle active={mode === 'run'} onClick={() => setMode('run')}>One run, turn by turn</Toggle>
          <Toggle active={mode === 'all'} onClick={() => setMode('all')}>All runs</Toggle>
        </>
      }
      caption={
        mode === 'run'
          ? <>Prompt size at each model call of one run (&ldquo;{data.sample.title}&rdquo;), split by what was added. Hover for the breakdown. Dashed: where Claude Code compacts, and the 128K window.</>
          : <>Everything that grew the context, summed over {data.totals.runs} runs.</>
      }
    >
      {mode === 'run' ? <RunContext /> : <Growth />}
      <Legend items={CATS.filter(c => mode === 'run' || (data.growth as Record<string, number>)[c.key]).map(c => ({ name: c.name, color: catColor(c.key) }))} />
    </Figure>
  )
}

function RunContext() {
  const [ref, W] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const calls = data.sample.calls
  const H = 260, pw = W - PAD.l - PAD.r, ph = H - PAD.t - PAD.b
  const top = data.sample.window * 1.04
  const X = (i: number) => PAD.l + (calls.length > 1 ? (i / (calls.length - 1)) * pw : pw / 2)
  const Y = (v: number) => PAD.t + ph - (v / top) * ph
  const cum = calls.map(c => {
    let s = 0
    return CATS.map(cat => (s += (c.comp as Record<string, number>)[cat.key] || 0))
  })
  const areas = CATS.map((cat, j) => {
    let d = ''
    calls.forEach((_, i) => (d += `${i ? 'L' : 'M'}${X(i)},${Y(cum[i][j])}`))
    for (let i = calls.length - 1; i >= 0; i--) d += `L${X(i)},${Y(j ? cum[i][j - 1] : 0)}`
    return { key: cat.key, d: d + 'Z' }
  }).reverse()
  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left) / r.width) * (calls.length - 1))
    setHover(Math.max(0, Math.min(calls.length - 1, i)))
  }
  const h = hover != null ? calls[hover] : null
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Context size per model call, stacked by category">
        {ticks(top / 1.04).map(t => (
          <g key={t}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(t)} y2={Y(t)} stroke="var(--color-border)" />
            <text x={PAD.l - 6} y={Y(t) + 3} textAnchor="end" style={axisText}>{k(t)}</text>
          </g>
        ))}
        {areas.map(a => <path key={a.key} d={a.d} fill={catColor(a.key)} fillOpacity={0.88} />)}
        {[{ v: data.sample.compact_at, label: 'compaction ≈ 90K' }, { v: data.sample.window, label: 'window 128K' }].map(l => (
          <g key={l.label}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(l.v)} y2={Y(l.v)} stroke="var(--color-ink)" strokeDasharray="4 4" strokeOpacity={0.55} />
            <text x={W - PAD.r} y={Y(l.v) - 4} textAnchor="end" style={axisText}>{l.label}</text>
          </g>
        ))}
        {ticks(calls.length - 1, 6).filter(t => Number.isInteger(t) && X(t) < W - PAD.r - 34).map(t => (
          <text key={t} x={X(t)} y={H - 6} textAnchor="middle" style={axisText}>{t}</text>
        ))}
        <text x={W - PAD.r} y={H - 6} textAnchor="end" style={axisText}>turn</text>
        {h && <line x1={X(hover!)} x2={X(hover!)} y1={PAD.t} y2={PAD.t + ph} stroke="var(--color-ink)" strokeOpacity={0.5} />}
        <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {h && (
        <Tip x={X(hover!)} y={PAD.t} width={W}>
          <div><b>Turn {h.turn}</b> · {h.min?.toFixed(1)} min in · {k(h.total)} tokens</div>
          {CATS.filter(c => (h.comp as Record<string, number>)[c.key] > 200).reverse().map(c => (
            <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: catColor(c.key), marginRight: 5 }} />{c.name}</span>
              <span>{k((h.comp as Record<string, number>)[c.key])}</span>
            </div>
          ))}
        </Tip>
      )}
    </div>
  )
}

function Growth() {
  const g = data.growth as Record<string, number>
  const rows = CATS.filter(c => g[c.key]).sort((a, b) => g[b.key] - g[a.key])
  const total = rows.reduce((s, c) => s + g[c.key], 0)
  return (
    <div style={{ display: 'grid', gap: 6, padding: '0.25rem 0' }}>
      {rows.map(c => (
        <div key={c.key} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 90px', gap: 10, alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
          <span style={{ color: 'var(--color-ink)' }}>{c.name}</span>
          <span style={{ background: 'var(--color-border)', borderRadius: 2, height: 12 }}>
            <span style={{ display: 'block', height: '100%', width: `${(100 * g[c.key]) / total}%`, background: catColor(c.key), borderRadius: 2, transition: 'width 400ms ease' }} />
          </span>
          <span style={{ color: 'var(--color-muted)', textAlign: 'right' }}>{Math.round((100 * g[c.key]) / total)}% · {k(g[c.key])}</span>
        </div>
      ))}
    </div>
  )
}

// ── hourly line/area charts over the three days ────────────────────────────────────────────────────

function HourlyFrame({
  series, stacked, yMax, yFmt, tip, height = 230,
}: {
  series: { name: string; color: string; v: (number | null)[] }[]
  stacked?: boolean
  yMax?: number
  yFmt: (v: number) => string
  tip: (i: number) => React.ReactNode
  height?: number
}) {
  const [ref, W] = useWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const t = data.hourly.t, n = t.length, H = height
  const pw = W - PAD.l - PAD.r, ph = H - PAD.t - PAD.b
  const cum = t.map((_, i) => {
    let s = 0
    return series.map(se => (s = (stacked ? s : 0) + (se.v[i] ?? 0)))
  })
  const max = yMax ?? Math.max(1, ...cum.map(c => (stacked ? c[c.length - 1] : Math.max(...c))))
  const top = max * 1.06
  const X = (i: number) => PAD.l + (i / (n - 1)) * pw
  const Y = (v: number) => PAD.t + ph - (v / top) * ph
  const sw = t.findIndex(x => x >= data.hourly.switch)
  const days = t.map((x, i) => [x, i] as const).filter(([x]) => new Date(x * 1000).getHours() === 0)
  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))))
  }
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} role="img">
        <rect x={PAD.l} y={PAD.t} width={Math.max(0, X(sw) - PAD.l)} height={ph} fill="var(--color-ink)" fillOpacity={0.05} />
        <text x={PAD.l + 6} y={PAD.t + 12} style={axisText}>Ollama</text>
        <text x={X(sw) + 6} y={PAD.t + 12} style={axisText}>llama-server</text>
        <line x1={X(sw)} x2={X(sw)} y1={PAD.t} y2={PAD.t + ph} stroke="var(--color-ink)" strokeOpacity={0.45} strokeDasharray="3 3" />
        {ticks(max).map(v => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={Y(v)} y2={Y(v)} stroke="var(--color-border)" />
            <text x={PAD.l - 6} y={Y(v) + 3} textAnchor="end" style={axisText}>{yFmt(v)}</text>
          </g>
        ))}
        {days.map(([x, i]) => (
          <text key={x} x={X(i)} y={H - 6} textAnchor="middle" style={axisText}>
            {new Date(x * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' })}
          </text>
        ))}
        {stacked
          ? series.map((se, j) => {
              let d = ''
              t.forEach((_, i) => (d += `${i ? 'L' : 'M'}${X(i)},${Y(cum[i][j])}`))
              for (let i = n - 1; i >= 0; i--) d += `L${X(i)},${Y(j ? cum[i][j - 1] : 0)}`
              return <path key={se.name} d={d + 'Z'} fill={se.color} fillOpacity={0.85} />
            }).reverse()
          : series.map(se => {
              let d = '', pen = false
              se.v.forEach((v, i) => {
                if (v == null) { pen = false; return }
                d += `${pen ? 'L' : 'M'}${X(i)},${Y(v)}`
                pen = true
              })
              return <path key={se.name} d={d} fill="none" stroke={se.color} strokeWidth={2} strokeLinejoin="round" />
            })}
        {hover != null && <line x1={X(hover)} x2={X(hover)} y1={PAD.t} y2={PAD.t + ph} stroke="var(--color-ink)" strokeOpacity={0.5} />}
        <rect x={PAD.l} y={PAD.t} width={pw} height={ph} fill="transparent" onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hover != null && (
        <Tip x={X(hover)} y={PAD.t} width={W}>
          <div><b>{hourLabel(t[hover])}</b></div>
          {tip(hover)}
        </Tip>
      )}
    </div>
  )
}

export function CacheReuseChart() {
  const r = data.hourly.reuse
  const e = (data as { reuse_by_era?: { ollama: number; llama: number } }).reuse_by_era
  return (
    <Figure caption={<>Share of each hour&apos;s prompt tokens the model server did not have to re-read (the prefix it already held). {e && <>All requests: <b>{e.ollama}%</b> on Ollama, <b>{e.llama}%</b> on llama-server.</>}</>}>
      <HourlyFrame
        series={[{ name: 'reused', color: SERIES[2], v: r }]}
        yMax={100}
        yFmt={v => `${v}%`}
        tip={i => <div>{r[i] == null ? 'no requests' : `${r[i]}% of the prompt reused`}</div>}
      />
    </Figure>
  )
}

export function ThroughputChart() {
  const [mode, setMode] = useState<'total' | 'speed'>('total')
  const h = data.hourly, o = data.one_two
  const sys = o.system as Record<string, { tok_per_min: number }>
  const agents = h.tags.map((tag, i) => ({ name: agentName(tag), color: SERIES[[5, 0, 2][i % 3]], v: h.tok_per_min[i] }))
  return (
    <Figure
      controls={
        <>
          <Toggle active={mode === 'total'} onClick={() => setMode('total')}>Tokens / min, all agents</Toggle>
          <Toggle active={mode === 'speed'} onClick={() => setMode('speed')}>Speed of one request</Toggle>
        </>
      }
      caption={
        mode === 'total'
          ? <>Tokens generated per minute, averaged per hour and stacked by agent. Over whole periods, two agents produced <b>{(sys['2'].tok_per_min / sys['1'].tok_per_min).toFixed(2)}×</b> the tokens of one ({k(sys['1'].tok_per_min)} → {k(sys['2'].tok_per_min)} per minute).</>
          : <>Average generation speed of a single request, per hour. Alone a request runs at a median <b>{o.alone_med.toFixed(1)} tok/s</b>; while the other agent is also generating, <b>{o.shared_med.toFixed(1)} tok/s</b> ({o.alone_n + o.shared_n} requests).</>
      }
    >
      {mode === 'total' ? (
        <HourlyFrame
          stacked
          series={agents}
          yFmt={k}
          tip={i => agents.filter(a => a.v[i]).map(a => (
            <div key={a.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span>{a.name}</span><span>{k(a.v[i] as number)}/min</span></div>
          ))}
        />
      ) : (
        <HourlyFrame
          series={[{ name: 'tok/s', color: SERIES[1], v: h.tps }]}
          yFmt={v => `${v}`}
          tip={i => <div>{h.tps[i] == null ? 'no requests' : `${h.tps[i]} tok/s per request`}</div>}
        />
      )}
      {mode === 'total' && <Legend items={agents.map(a => ({ name: a.name, color: a.color }))} />}
    </Figure>
  )
}

// ── where the wall-clock time goes ─────────────────────────────────────────────────────────────────

const PARTS = [
  { key: 'prefill_s', name: 'Reading the prompt (prefill)', color: SERIES[0] },
  { key: 'gen_s', name: 'Writing tokens (generation)', color: SERIES[1] },
  { key: 'tool_s', name: 'Tools running', color: SERIES[2] },
  { key: 'other_s', name: 'Harness + overhead', color: SERIES[5] },
] as const

export function TimeSplitChart() {
  const [hover, setHover] = useState<string | null>(null)
  return (
    <Figure caption={<>Each agent&apos;s wall-clock time, summed over all runs of each setup. Hover a segment for hours and share.</>}>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        {data.time_split.map(era => (
          <div key={era.era}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-ink)', marginBottom: 4 }}>
              {era.era} <span style={{ color: 'var(--color-muted)' }}>· {era.runs} runs · {hm(era.wall_s)}</span>
            </div>
            <div style={{ display: 'flex', gap: 2, height: 20 }}>
              {PARTS.map(p => {
                const v = era[p.key], id = era.era + p.key, pct = Math.round((100 * v) / era.wall_s)
                return (
                  <div
                    key={p.key}
                    onMouseEnter={() => setHover(id)}
                    onMouseLeave={() => setHover(null)}
                    title={`${p.name}: ${hm(v)} (${pct}%)`}
                    style={{ flex: v, minWidth: 2, background: p.color, borderRadius: 2, position: 'relative', opacity: hover && hover !== id ? 0.55 : 1, transition: 'opacity 120ms ease' }}
                  >
                    {hover === id && (
                      <div style={{ position: 'absolute', bottom: 26, left: 0, whiteSpace: 'nowrap', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 3, padding: '0.3rem 0.5rem', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-ink)', zIndex: 2 }}>
                        {p.name}: <b>{pct}%</b> · {hm(v)}
                      </div>
                    )}
                    {pct >= 9 && <span style={{ position: 'absolute', left: 6, top: 2, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#fff' }}>{pct}%</span>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <Legend items={PARTS.map(p => ({ name: p.name, color: p.color }))} />
    </Figure>
  )
}

// ── a task's place in the plan, as the reports show it ─────────────────────────────────────────────

export function PlanRow({ title, why }: { title: string; why: string }) {
  return <>{title}{why}</> // rendered by PlanPath; string props only (MDX blocks JS expressions)
}

export function PlanPath({ children }: { children: React.ReactNode }) {
  const rows = Children.toArray(children).filter(isValidElement) as React.ReactElement<{ title: string; why: string }>[]
  return (
    <div style={{ margin: '1.5rem 0', border: '1px solid var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
      {rows.map(({ props: { title, why } }, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)',
            gap: '1rem',
            padding: '0.5rem 0.75rem',
            paddingLeft: `${0.75 + i * 0.9}rem`,
            borderTop: i ? '1px solid var(--color-border)' : 'none',
            fontSize: 13.5,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: 'var(--color-ink)', fontWeight: 500 }}>{title}</span>
          <span style={{ color: 'var(--color-muted)' }}>{why}</span>
        </div>
      ))}
    </div>
  )
}
