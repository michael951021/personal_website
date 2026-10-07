import sources from '@/content/writing/data/speculative-sources.json'
import { SpeculativeTable, smallStyle } from './speculative-table'

function currentPath(path: string) {
  return path.replace(/^draftlab\//, 'speculative_agent_workloads/')
}

export function SpeculativeArchitecture() {
  return <SpeculativeTable label="Speculative decoding architecture" headers={['Stage', 'What it does']} rows={[
    ['Collect', 'Classify agent traces, separate fenced code, remove duplicates, tokenize, and split by run.'],
    ['Draft', 'Use n-grams, a distilled student, LoRA, or LoRA with DPO to propose tokens.'],
    ['Verify', 'The JAX target scores the drafts together, accepts a prefix, replaces a rejection, and rolls back the cache.'],
    ['Measure', 'Measure distribution overlap, decoding steps, and output quality.'],
    ['Serve', 'API client → Go gateway → FastAPI engine or optional vLLM backend → streamed completion.'],
  ]} />
}

export function SpeculativeStrategies() {
  return <SpeculativeTable label="Drafter strategies" headers={['Drafter', 'How it works', 'Settings']} rows={[
    ['N-gram', 'Find recent sequences in earlier committed context and propose the following token. No neural model call or access to future text.', 'Sequences of one to four tokens.'],
    ['Tiny distilled', 'Train a JAX student with the same token vocabulary and its own embeddings. Save the teacher’s top-64 probabilities and aggregate tail mass for distillation.', '4 layers, width 256, 43.8M parameters.'],
    ['LoRA', 'Adapt Qwen2.5-0.5B to agent traffic with small trainable matrices on attention and MLP projections. The repo has FSDP training and a GPU-only QLoRA path.', 'Rank 16, scaling 32.'],
    ['LoRA + DPO', 'Train with target-corrected tokens as preferred examples and rejected drafts as the other choice. Pair construction still needs fixing.', 'TRL DPO, β = 0.1.'],
  ]} />
}

export function SpeculativeNext() {
  return <SpeculativeTable label="Remaining experiments" headers={['Question', 'Next measurement', 'Saved status']} rows={[
    ['Does speculation save time?', 'Compare the fixed engine with target-only decoding on matched prompts and controlled timing.', 'Benchmark results pending.'],
    ['Does a smaller drafter help a larger target?', 'Run the 1.5B sweep with the 0.5B adapters, then compare timing.', '1.5B sweep pending.'],
    ['Does DPO improve acceptance?', 'Rebuild preference pairs, compare within runs, and include the unadapted model.', 'Small observed increase; effect unresolved.'],
    ['Do corpus scores predict generation?', 'Score generated histories at the same positions and temperature on the fixed engine.', 'Saved trajectories predate the fixes.'],
    ['Does the GPU path improve latency?', 'Benchmark kernels and serving on a GPU, with target-only and speculative configurations.', 'Host script exists; no GPU results.'],
    ['Can someone reproduce it?', 'Check a fresh clone, explicitly skip missing data or models, then run the full verification checks.', 'An open task lists four missing-data test failures.'],
  ]} />
}

export function SpeculativeSources() {
  return (
    <div>
      <details style={{ margin: '1.5rem 0' }}>
        <summary style={{ cursor: 'pointer' }}>Source files and hashes</summary>
        <SpeculativeTable label="Speculative decoding source manifest" headers={['Project-relative path', 'Used for', 'SHA-256 prefix']} rows={sources.sources.map(s => [
          <span key={s.path} style={{ overflowWrap: 'anywhere' }}>{currentPath(s.path)}</span>, s.purpose, <span key={s.sha256} title={s.sha256}>{s.sha256.slice(0, 12)}</span>,
        ])} />
        <p style={smallStyle}>Paths use the current package name. Hashes refer to the saved snapshot; the evidence JSON retains its original paths and full hashes. Only aggregate columns were read to count the local held-out corpus.</p>
      </details>
      <details style={{ margin: '1.5rem 0' }}>
        <summary style={{ cursor: 'pointer' }}>Code and test diffs</summary>
        <p style={smallStyle}>These diffs preserve the original paths and implementation at each recorded commit.</p>
        {Object.entries(sources.commits).map(([name, commit]) => (
          <details key={name} id={`speculative-commit-${name}`} style={{ margin: '1rem 0' }}>
            <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{commit.short}: {commit.subject}</summary>
            <p style={{ ...smallStyle, overflowWrap: 'anywhere' }}>{commit.date} · {commit.paths.map(currentPath).join(', ')}</p>
            <pre style={{ padding: '1rem', border: '1px solid var(--color-border)', background: 'var(--color-surface)', overflowX: 'auto', maxHeight: 420, fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}><code>{commit.diff}</code></pre>
          </details>
        ))}
      </details>
    </div>
  )
}
