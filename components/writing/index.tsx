// Components that writing posts (content/writing/*.mdx) can use by name.
import { CacheReuseChart, ContextChart, PlanPath, PlanRow, ThroughputChart, TimeSplitChart } from './loop-charts'
import { SpeculativeCorpus, SpeculativeCost, SpeculativeDistill, SpeculativeJudge, SpeculativeKinds, SpeculativeOverlap, SpeculativeSpeedup, SpeculativeStep, SpeculativeSweep } from './speculative-charts'
import { LoopgymKernel, LoopgymPassAt1, LoopgymTraining } from './loopgym-charts'
import { MemRegimes, MemSuccess } from './mem-charts'
import { MuonPaired, MuonSpectra, MuonTuning } from './muon-charts'
import { SpeculativeArchitecture, SpeculativeNext, SpeculativeSources, SpeculativeStrategies } from './speculative-details'

export const writingComponents = {
  LoopgymKernel, LoopgymPassAt1, LoopgymTraining,
  MemRegimes, MemSuccess, MuonPaired, MuonSpectra, MuonTuning,
  CacheReuseChart, ContextChart, PlanPath, PlanRow, ThroughputChart, TimeSplitChart,
  SpeculativeArchitecture, SpeculativeCorpus, SpeculativeCost, SpeculativeDistill, SpeculativeJudge,
  SpeculativeKinds, SpeculativeNext, SpeculativeOverlap, SpeculativeSources, SpeculativeStep,
  SpeculativeSpeedup, SpeculativeStrategies, SpeculativeSweep,
}
