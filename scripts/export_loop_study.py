#!/usr/bin/env python3
"""Export the agent-loop study data used by content/writing/local-multi-agent-loop.mdx.

  python3 scripts/export_loop_study.py [LOOP_DIR] [SAMPLE_RUN_REPORT]

LOOP_DIR (default ../loop) is the local-agent-loop checkout; its reports/study.json is rebuilt by
`lib/study.py` there. SAMPLE_RUN_REPORT is one run's end report (reports/<project>/<run>-end.html), used for the
single-run context chart and published as the "sample" page. Writes:
  content/writing/data/local-multi-agent-loop.json
  public/writing/local-multi-agent-loop/sample-run.html   (the run report, links back to the report server removed)
Stdlib only.
"""
import json
import re
import sys
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
LOOP = Path(sys.argv[1]) if len(sys.argv) > 1 else SITE.parent / "loop"
SAMPLE = Path(sys.argv[2]) if len(sys.argv) > 2 else LOOP / "reports/contrib-loop/20260927-2136-w1-f97007fa-end.html"
DATA_RE = re.compile(r'(<script id="data" type="application/json">)(.*?)(</script>)', re.S)


def main():
    study = json.loads((LOOP / "reports/study.json").read_text())
    page = SAMPLE.read_text()
    run = json.loads(DATA_RE.search(page).group(2).replace("<\\/", "</"))

    ot = study["over_time"]
    out = {
        "cats": study["cats"],
        "sample": {
            "title": run["title"], "window": run["window"], "compact_at": run["window"] - 8192 - 32768,
            "calls": [{"turn": c["turn"], "min": c["min"], "total": c["total"], "comp": c["comp"]} for c in run["calls"]],
        },
        "growth": study["growth"],
        "hourly": {"t": ot["t"], "reuse": ot["reuse"], "tps": ot["tps"], "tags": ot["tags"],
                   "tok_per_min": ot["gen_per_tag"], "switch": ot["eras"][1]["t"]},
        "one_two": {k: study["one_two"][k] for k in ("alone_med", "shared_med", "alone_n", "shared_n", "system")},
        "time_split": study["time_split"],
        "reuse_by_era": study["reuse_by_era"],
        "totals": study["totals"],
    }
    dest = SITE / "content/writing/data/local-multi-agent-loop.json"
    dest.write_text(json.dumps(out, separators=(",", ":")))
    print(dest, f"{dest.stat().st_size // 1024} KB")

    # The sample page: same report, without the links into the local report server.
    run["diff"] = None
    page = DATA_RE.sub(lambda m: m.group(1) + json.dumps(run, separators=(",", ":")).replace("</", "<\\/") + m.group(3), page)
    page = page.replace(' · <a href="../index.html">all reports</a> · <a href="../fleet.html">fleet</a>', "")
    sample = SITE / "public/writing/local-multi-agent-loop/sample-run.html"
    sample.parent.mkdir(parents=True, exist_ok=True)
    sample.write_text(page)
    print(sample)


if __name__ == "__main__":
    main()
