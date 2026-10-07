// Components that writing posts (content/writing/*.mdx) can use by name.
import { CacheReuseChart, ContextChart, PlanPath, PlanRow, ThroughputChart, TimeSplitChart } from './loop-charts'
import { SpeculativeCorpus, SpeculativeCost, SpeculativeDistill, SpeculativeJudge, SpeculativeKinds, SpeculativeOverlap, SpeculativeStep, SpeculativeSweep } from './speculative-charts'
import { SpeculativeArchitecture, SpeculativeNext, SpeculativeSources, SpeculativeStrategies } from './speculative-details'

export const writingComponents = {
  CacheReuseChart, ContextChart, PlanPath, PlanRow, ThroughputChart, TimeSplitChart,
  SpeculativeArchitecture, SpeculativeCorpus, SpeculativeCost, SpeculativeDistill, SpeculativeJudge,
  SpeculativeKinds, SpeculativeNext, SpeculativeOverlap, SpeculativeSources, SpeculativeStep,
  SpeculativeStrategies, SpeculativeSweep,
}
