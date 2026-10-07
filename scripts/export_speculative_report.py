#!/usr/bin/env python3
"""Export the saved Speculative report's aggregate data and portable downloads.

Usage: python3 scripts/export_speculative_report.py [REPORT_HTML]
Defaults to the separate rewritten report in the sibling loop checkout.
The MDX article stays unchanged. No experiments are rerun.
"""

import argparse
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def rebrand_report(page: str) -> str:
    """Update current labels and commands while preserving recorded evidence."""
    segments = re.split(
        r"(<script\b[^>]*>.*?</script>|<pre\b[^>]*>.*?</pre>)", page, flags=re.S
    )
    renamed = []
    for segment in segments:
        snapshot = segment.startswith("<script") and (
            'id="report-data"' in segment or 'id="csv-data"' in segment
        )
        original_diff = segment.startswith("<pre") and "<code>diff --git " in segment
        if not snapshot and not original_diff:
            segment = segment.replace("draftlab/", "speculative_agent_workloads/")
            segment = segment.replace("draftlab.", "speculative_agent_workloads.")
            segment = segment.replace("draftlab_", "speculative_agent_workloads_")
            segment = segment.replace("draftlab-commit-", "speculative-commit-")
            segment = segment.replace("draftlab-", "speculative-agent-workloads-")
            segment = re.sub(
                r"\bdraftlab\b", "Speculative Decoding for Agent Workloads",
                segment, flags=re.I,
            )
        renamed.append(segment)
    return "".join(renamed)


def embedded_json(page: str, identifier: str):
    match = re.search(
        rf'<script\b[^>]*\bid="{identifier}"[^>]*>(.*?)</script>', page, re.S
    )
    if match is None:
        raise ValueError(f"Missing {identifier} in the source report")
    return match[1], json.loads(match[1])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "report", nargs="?", type=Path,
        default=ROOT.parent / "loop/reports/speculative-agent-workloads-report-rewritten.html",
    )
    args = parser.parse_args()
    page = args.report.read_text(encoding="utf-8")
    page = rebrand_report(page)
    evidence_text, evidence = embedded_json(page, "report-data")
    _, csv_text = embedded_json(page, "csv-data")
    charts = {
        key: evidence[key]
        for key in ["generated_at", "revision", "corpus", "heldout", "sweep", "judge", "curves"]
    }
    charts["alpha"] = {
        name: {key: values[key] for key in ["overall", "by_kind"]}
        for name, values in evidence["alpha"].items()
    }
    sources = {
        key: evidence[key] for key in ["generated_at", "revision", "sources", "commits"]
    }
    public = ROOT / "public/writing/speculative-agent-workloads"
    chart_dir = ROOT / "content/writing/data"
    public.mkdir(parents=True, exist_ok=True)
    chart_dir.mkdir(parents=True, exist_ok=True)
    for name, value in [("speculative-agent-workloads.json", charts), ("speculative-sources.json", sources)]:
        (chart_dir / name).write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")
    (public / "evidence.json").write_text(evidence_text + "\n", encoding="utf-8")
    (public / "metrics.csv").write_bytes(csv_text.encode("utf-8"))
    (public / "report.html").write_text(page, encoding="utf-8")
    print(f"Exported saved results from {args.report} (revision {evidence['revision'][:7]})")


if __name__ == "__main__":
    main()
