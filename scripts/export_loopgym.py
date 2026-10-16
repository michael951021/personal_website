#!/usr/bin/env python3
"""Refresh content/writing/data/loopgym.json from the loopgym project's results.

Usage: scripts/export_loopgym.py [LOOPGYM_DIR]   (default ../loop/projects/loopgym)

Reads the GRPO metrics logs (runs/*/metrics.jsonl), the pass@1 evals (results/eval/),
the paired analyses (results/grpo{05,15}_summary.json, written by tools/check_results.py),
the log-prob kernel bench and the vLLM-vs-HF gate. Stdlib only.
"""
import json
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
OUT = SITE / 'content' / 'writing' / 'data' / 'loopgym.json'
RUNS = {'grpo15': ('grpo15_gpu', '1.5B · 2×3090 · 100 steps'), 'grpo05': ('grpo05_exercism', '0.5B · CPU · 40 steps')}


def load(p: Path):
    return json.loads(p.read_text()) if p.is_file() else None


def training(root: Path, run: str) -> dict:
    rows = [json.loads(line) for line in (root / 'runs' / run / 'metrics.jsonl').read_text().splitlines() if line.strip()]
    train = {r['step']: r for r in rows if 'kind' not in r}  # a resumed run may log a step twice: keep the last
    return {
        'steps': [{'step': s, 'reward': round(r['reward_mean'], 4), 'nosignal': round(r['frac_groups_all_same'], 4),
                   'kl': r['kl'], 'step_s': round(r['step_s'], 1)} for s, r in sorted(train.items())],
        'evals': [{'step': r['step'], 'reward': round(r['reward_mean'], 4), 'tasks': len(r['tasks'])}
                  for r in rows if r.get('kind') == 'eval'],
    }


def evals(root: Path) -> list[dict]:
    out = []
    for size in ('05', '15'):
        for arm in ('base', 'grpo'):
            for split, fname in (('val', 'val'), ('loopgym', 'loopgym')):
                e = load(root / 'results' / 'eval' / f'{arm}{size}_{fname}.json')
                if e is None:
                    continue
                out.append({'model': f'{size[0]}.{size[1]}B', 'arm': arm, 'split': split, 'pass': round(e['pass_at_k'], 4),
                            'ci': [round(v, 4) for v in e['ci']], 'n': e['n'], 'n_tasks': e['n_tasks']})
    return out


def main() -> None:
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else SITE.parent / 'loop' / 'projects' / 'loopgym'
    bench = load(root / 'results' / 'bench_logprob.json')
    check = load(root / 'results' / 'gpu' / 'vllm_hf_check.json') or load(
        root.parents[1] / 'work' / 'loopgym' / 'job-gpurun1' / 'results' / 'gpu' / 'vllm_hf_check.json')
    v0 = load(root / 'results' / 'loopgym_v0.json') or {}
    mining = load(root / 'results' / 'mining.json') or {}
    doc = {
        'runs': {tag: {'label': label, **training(root, run)} for tag, (run, label) in RUNS.items()},
        'evals': evals(root),
        'paired': {tag: s['val'] for tag in RUNS if (s := load(root / 'results' / f'{tag}_summary.json'))},
        'hack': {tag: h and {'n': h['n'], 'n_matches': h['n_matches'], 'n_flagged': h['n_flagged']}
                 for tag in RUNS if (h := load(root / 'results' / f'{tag}_hackcheck.json'))},
        'kernel': {'T': 2048, 'V': bench['V'], 'cells': [
            {'impl': c['impl'], 'time_s': c['time_median_s'], 'peak_bytes': c['peak_extra_bytes']}
            for c in bench['cells'] if c['T'] == 2048 and c['impl'] in ('naive', 'torch', 'cpp')]},
        'vllm_check': check and {'mean_abs_delta': check['fp32']['mean_abs_delta'], 'tokens': check['fp32']['tokens_compared'],
                                 'gate': check['gate_nats']},
        'loopgym_v0': {'n_tasks': v0.get('n_tasks'), 'n_candidates': mining.get('candidates')},
    }
    OUT.write_text(json.dumps(doc, indent=1) + '\n')
    print(f'wrote {OUT.relative_to(SITE)}: {len(doc["evals"])} evals, runs {list(doc["runs"])}')


if __name__ == '__main__':
    main()
