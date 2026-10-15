#!/usr/bin/env python3
"""Refresh the speculative post's sweep and speed data from the project's results/.

Usage: python3 scripts/export_speculative_results.py [PROJECT_DIR]
Updates sweep (0.5B target), sweep15 (1.5B target) and speedup in
content/writing/data/speculative-agent-workloads.json. Aggregates only: no prompts,
token text or run identifiers. Needs polars (or run with the project's venv).
"""

import json
import sys
from pathlib import Path

import polars as pl

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'content/writing/data/speculative-agent-workloads.json'


def cells(path: Path) -> dict:
    df = pl.read_parquet(path)
    agg = (df.group_by(['drafter', 'k', 'temp'])
             .agg(n_prompts=pl.col('i').n_unique(), n_runs=pl.col('run').n_unique(),
                  n_draft=pl.sum('n_draft'), n_acc=pl.sum('n_acc'),
                  n_steps=pl.sum('n_steps'), n_emit=pl.sum('n_emit'))
             .sort(['drafter', 'k', 'temp']))
    prompts = df['i'].n_unique()
    out = []
    for r in agg.iter_rows(named=True):
        r['status'] = 'complete' if r['n_prompts'] == prompts else 'partial'
        r['accept'] = r['n_acc'] / r['n_draft'] if r['n_draft'] else None
        r['tpc'] = r['n_emit'] / r['n_steps']
        out.append(r)
    return dict(target=str(df['target'][0]), n_gen=int(df['n_gen'][0]),
                n_prompts_per_cell=prompts, rows=len(df), cells=out)


def main(project: Path) -> None:
    data = json.loads(DATA.read_text())
    data['sweep'] = cells(project / 'results/sweep.parquet')
    data['sweep15'] = cells(project / 'results/sweep_1.5b.parquet')
    bench = json.loads((project / 'results/speedup_bench.json').read_text())
    data['speedup'] = dict(
        n_gen=bench['n_gen'], reps=bench['reps'], split=bench['split'],
        rows=[dict(target=target, n_prompts=t['n_prompts'], **{k: v for k, v in r.items()})
              for target, t in bench['targets'].items() for r in t['configs'].values()])
    DATA.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n')
    print(f"{DATA}: sweep {len(data['sweep']['cells'])} cells, sweep15 {len(data['sweep15']['cells'])}, "
          f"speedup {len(data['speedup']['rows'])} rows")


if __name__ == '__main__':
    main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent / 'loop/projects/speculative-agent-workloads')
