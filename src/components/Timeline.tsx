import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import TrackLane from './TrackLane'
import { useProjectStore } from '../store/projectStore'
import { clsx } from 'clsx'

interface TimelineProps {
  onTimeChange?: (time: number) => void
}

const MIN_ZOOM = 10
const MAX_ZOOM = 500

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

export default function Timeline({ onTimeChange }: TimelineProps) {
  const { timeline, playhead, zoom, scrollX, duration, setPlayhead, setZoom, setScrollX } = useProjectStore(
    useShallow((state) => ({
      timeline: state.timeline,
      playhead: state.playhead,
      zoom: state.zoom,
      scrollX: state.scrollX,
      duration: state.duration,
      setPlayhead: state.setPlayhead,
      setZoom: state.setZoom,
      setScrollX: state.setScrollX,
    }))
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isDraggingRuler, setIsDraggingRuler] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartScrollX, setDragStartScrollX] = useState(0)

  const timelineDuration = useMemo(() => {
    const clipEnds = timeline?.tracks.flatMap(t => t.clips.map(c => c.endTime)) ?? []
    return Math.max(duration, 0, ...clipEnds)
  }, [timeline, duration])

  const totalWidth = timelineDuration * zoom

  const getMaxScroll = useCallback(() => {
    const viewportWidth = containerRef.current?.clientWidth ?? 0
    return Math.max(0, totalWidth - viewportWidth)
  }, [totalWidth])

  // Wheel zoom/pan needs a non-passive listener, otherwise preventDefault()
  // is ignored by the browser (React attaches wheel handlers as passive).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        // Zoom, keeping the time under the cursor anchored
        const rect = el.getBoundingClientRect()
        const mouseX = e.clientX - rect.left + scrollX
        const newZoom = clamp(zoom - e.deltaY * 0.1, MIN_ZOOM, MAX_ZOOM)
        const newScrollX = clamp((mouseX * newZoom) / zoom - (e.clientX - rect.left), 0, getMaxScroll())
        setZoom(newZoom)
        setScrollX(newScrollX)
      } else {
        // Pan horizontally
        setScrollX((prev) => clamp(prev + e.deltaX, 0, getMaxScroll()))
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [zoom, scrollX, getMaxScroll, setZoom, setScrollX])

  const handleRulerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const rect = rulerRef.current?.getBoundingClientRect()
    if (!rect) return
    const time = (e.clientX - rect.left + scrollX) / zoom
    setPlayhead(Math.max(0, Math.min(timelineDuration, time)))
    onTimeChange?.(time)
    setIsScrubbing(true)
  }, [scrollX, zoom, timelineDuration, setPlayhead, onTimeChange])

  const handleRulerMouseMove = useCallback((e: MouseEvent) => {
    if (!isScrubbing) return
    const rect = rulerRef.current?.getBoundingClientRect()
    if (!rect) return
    const time = (e.clientX - rect.left + scrollX) / zoom
    const clampedTime = Math.max(0, Math.min(timelineDuration, time))
    setPlayhead(clampedTime)
    onTimeChange?.(clampedTime)
  }, [isScrubbing, scrollX, zoom, timelineDuration, setPlayhead, onTimeChange])

  const handleRulerMouseUp = useCallback(() => {
    setIsScrubbing(false)
  }, [])

  const handleContainerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || e.target !== e.currentTarget) return
    setIsDraggingRuler(true)
    setDragStartX(e.clientX)
    setDragStartScrollX(scrollX)
  }, [scrollX])

  const handleContainerMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRuler) return
    const deltaX = e.clientX - dragStartX
    setScrollX(clamp(dragStartScrollX - deltaX, 0, getMaxScroll()))
  }, [isDraggingRuler, dragStartX, dragStartScrollX, getMaxScroll, setScrollX])

  const handleContainerMouseUp = useCallback(() => {
    setIsDraggingRuler(false)
  }, [])

  useEffect(() => {
    if (isScrubbing || isDraggingRuler) {
      window.addEventListener('mousemove', handleRulerMouseMove)
      window.addEventListener('mousemove', handleContainerMouseMove)
      window.addEventListener('mouseup', handleRulerMouseUp)
      window.addEventListener('mouseup', handleContainerMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleRulerMouseMove)
        window.removeEventListener('mousemove', handleContainerMouseMove)
        window.removeEventListener('mouseup', handleRulerMouseUp)
        window.removeEventListener('mouseup', handleContainerMouseUp)
      }
    }
  }, [isScrubbing, isDraggingRuler, handleRulerMouseMove, handleContainerMouseMove, handleRulerMouseUp, handleContainerMouseUp])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target?.isContentEditable
    ) {
      return
    }
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setPlayhead((prev) => Math.max(0, prev - (e.shiftKey ? 1 : 1 / 30)))
        break
      case 'ArrowRight':
        e.preventDefault()
        setPlayhead((prev) => Math.min(timelineDuration, prev + (e.shiftKey ? 1 : 1 / 30)))
        break
      case 'Home':
        e.preventDefault()
        setPlayhead(0)
        break
      case 'End':
        e.preventDefault()
        setPlayhead(timelineDuration)
        break
      case ' ':
        e.preventDefault()
        // Play/pause is not implemented yet
        break
    }
  }, [timelineDuration, setPlayhead])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!timeline) {
    return (
      <div className="flex h-full items-center justify-center bg-hypit-950 text-hypit-500">
        No timeline loaded
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative bg-hypit-950 overflow-hidden"
      onMouseDown={handleContainerMouseDown}
      tabIndex={0}
    >
      {/* Ruler */}
      <div
        ref={rulerRef}
        className="absolute top-0 left-0 right-0 h-8 bg-hypit-900 border-b border-hypit-800 z-10"
        style={{ width: totalWidth }}
        onMouseDown={handleRulerMouseDown}
      >
        {/* Time markers */}
        <div className="absolute inset-0 pointer-events-none" style={{ width: totalWidth }}>
          {Array.from({ length: Math.ceil(timelineDuration) + 1 }, (_, i) => i).map((second) => (
            <div
              key={second}
              className="absolute top-0 bottom-0 flex items-end px-1"
              style={{ left: second * zoom - scrollX }}
            >
              <div
                className={clsx(
                  'w-px',
                  second % 5 === 0 ? 'h-6 bg-hypit-400' : 'h-3 bg-hypit-600'
                )}
              />
              {second % 5 === 0 && (
                <span
                  className="absolute bottom-1 left-1 text-[10px] text-hypit-400 font-mono whitespace-nowrap"
                  style={{ transform: 'translateX(-50%)' }}
                >
                  {second}s
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Playhead on ruler */}
        <div
          className="absolute top-0 bottom-0 w-px bg-primary-500 pointer-events-none z-20"
          style={{ left: playhead * zoom - scrollX }}
        >
          <div
            className="absolute -left-2 top-0 w-4 h-4 bg-primary-500 rounded-t-[2px] border-2 border-hypit-950"
          />
        </div>
      </div>

      {/* Track Lanes */}
      <div
        className="absolute top-8 left-0 right-0 bottom-0 overflow-hidden"
        style={{ width: totalWidth }}
      >
        {timeline.tracks
          .filter(track => track.isVisible)
          .map((track) => (
            <TrackLane
              key={track.id}
              track={track}
              zoom={zoom}
              scrollX={scrollX}
              playhead={playhead}
              duration={timelineDuration}
            />
          ))}

        {/* Empty state */}
        {timeline.tracks.length === 0 && (
          <div className="flex h-full items-center justify-center text-hypit-500">
            <p>Add a track to get started</p>
          </div>
        )}
      </div>

      {/* Playhead line across tracks */}
      <div
        className="absolute top-8 left-0 bottom-0 w-px bg-primary-500/80 pointer-events-none z-20"
        style={{ left: playhead * zoom - scrollX }}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 bg-hypit-900/80 backdrop-blur-sm px-2 py-1 rounded-sm text-xs text-hypit-400 font-mono">
        {zoom.toFixed(0)}px/s
      </div>
    </div>
  )
}
