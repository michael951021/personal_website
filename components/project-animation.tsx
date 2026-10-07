'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const descriptions = {
  'local-multi-agent-loop': 'Two agents take tasks from a queue, then exchange results with a shared database.',
  'speculative-agent-workloads': 'A drafter predicts tokens; the target checks the block, keeps the accepted prefix and corrects a rejection.',
}
export type AnimationId = keyof typeof descriptions

function subscribeMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
function getReducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches }

export function ProjectAnimation({ scene, compact = false }: { scene: AnimationId; compact?: boolean }) {
  const element = useRef<HTMLDivElement>(null)
  const reduced = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(false)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    if (element.current) observer.observe(element.current)
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
  const playing = !reduced && !paused && visible && !hidden
  return (
    <div ref={element} className={'project-animation' + (compact ? ' project-animation-compact' : '')} data-animation={scene}>
      <Image
        src={'/animations/' + scene + '/' + (playing ? 'animation-transparent.webp' : 'poster-transparent.png')}
        alt={descriptions[scene]}
        width={192}
        height={112}
        unoptimized
        className="project-animation-art"
      />
      {!reduced && (
        <button
          type="button"
          className="project-animation-toggle"
          onClick={() => setPaused(value => !value)}
          aria-label={(paused ? 'Play' : 'Pause') + ' project animation'}
          aria-pressed={!paused}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" fill="currentColor">
            {paused ? <path d="M3 1L11 6L3 11Z" /> : <path d="M3 2H5V10H3ZM7 2H9V10H7Z" />}
          </svg>
        </button>
      )}
    </div>
  )
}
