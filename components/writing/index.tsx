// Components that writing posts (content/writing/*.mdx) can use by name.
import { CacheReuseChart, ContextChart, PlanPath, PlanRow, ThroughputChart, TimeSplitChart } from './loop-charts'
import { DraftlabCorpus, DraftlabCost, DraftlabDistill, DraftlabJudge, DraftlabKinds, DraftlabOverlap, DraftlabStep, DraftlabSweep } from './draftlab-charts'
import { DraftlabArchitecture, DraftlabNext, DraftlabSources, DraftlabStrategies } from './draftlab-details'

export const writingComponents = {
  CacheReuseChart, ContextChart, PlanPath, PlanRow, ThroughputChart, TimeSplitChart,
  DraftlabArchitecture, DraftlabCorpus, DraftlabCost, DraftlabDistill, DraftlabJudge,
  DraftlabKinds, DraftlabNext, DraftlabOverlap, DraftlabSources, DraftlabStep,
  DraftlabStrategies, DraftlabSweep,
}
