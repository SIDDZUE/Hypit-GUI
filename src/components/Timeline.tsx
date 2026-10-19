import { useRef, useEffect, useState, useCallback } from 'react'
import TrackLane from './TrackLane'
import { useProjectStore } from '../store/projectStore'
import { clsx } from 'clsx'

interface TimelineProps {
  onTimeChange?: (time: number) => void
}

export default function Timeline({ onTimeChange }: TimelineProps) {
  const { timeline, playhead, zoom, scrollX, duration, setPlayhead, setZoom, setScrollX } = useProjectStore(
    (state) => ({
      timeline: state.timeline,
      playhead: state.playhead,
      zoom: state.zoom,
      scrollX: state.scrollX,
      duration: state.duration,
      setPlayhead: state.setPlayhead,
      setZoom: state.setZoom,
      setScrollX: state.setScrollX,
    })
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const rulerRef = useRef<HTMLDivElement>(null)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [isDraggingRuler, setIsDraggingRuler] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartScrollX, setDragStartScrollX] = useState(0)

  const timelineDuration = timeline?.tracks[0]?.clips.reduce((max, c) => Math.max(max, c.endTime), duration) || duration
  const totalWidth = timelineDuration * zoom

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const mouseX = e.clientX - rect.left + scrollX
      const newZoom = Math.max(10, Math.min(500, zoom - e.deltaY * 0.1))
      const newScrollX = Math.max(0, (mouseX * newZoom) / zoom - e.clientX + rect.left)
      setZoom(newZoom)
      setScrollX(newScrollX)
    } else {
      // Pan horizontally
      setScrollX((prev) => Math.max(0, prev + e.deltaX))
    }
  }, [zoom, scrollX, setZoom, setScrollX])

  const handleRulerMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    const rect = rulerRef.current?.getBoundingClientRect()
    if (!rect) return
    const time = (e.clientX - rect.left + scrollX) / zoom
    setPlayhead(time)
    onTimeChange?.(time)
    setIsScrubbing(true)
  }, [scrollX, zoom, setPlayhead, onTimeChange])

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
    setScrollX(Math.max(0, dragStartScrollX - deltaX))
  }, [isDraggingRuler, dragStartX, dragStartScrollX, setScrollX])

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
    if (e.target instanceof HTMLInputElement) return
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        setPlayhead(Math.max(0, playhead - (e.shiftKey ? 1 : 1 / 30)))
        break
      case 'ArrowRight':
        e.preventDefault()
        setPlayhead(Math.min(timelineDuration, playhead + (e.shiftKey ? 1 : 1 / 30)))
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
        // Play/pause would be handled by parent
        break
    }
  }, [timelineDuration, playhead, setPlayhead])

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
      onWheel={handleWheel}
      onMouseDown={handleContainerMouseDown}
      onMouseMove={(e) => handleContainerMouseMove(e.nativeEvent)}
      onMouseUp={handleContainerMouseUp}
      onMouseLeave={handleContainerMouseUp}
      tabIndex={0}
    >
      {/* Ruler */}
      <div
        ref={rulerRef}
        className="absolute top-0 left-0 right-0 h-8 bg-hypit-900 border-b border-hypit-800 z-10"
        style={{ width: totalWidth }}
        onMouseDown={handleRulerMouseDown}
        onMouseMove={(e) => handleRulerMouseMove(e.nativeEvent)}
        onMouseUp={handleRulerMouseUp}
        onMouseLeave={handleRulerMouseUp}
      >
        {/* Time markers */}
        <div className="absolute inset-0" style={{ width: totalWidth }}>
          {Array.from({ length: Math.ceil(timelineDuration) + 1 }, (_, i) => i).map((second) => (
            <div
              key={second}
              className="absolute top-0 bottom-0 flex items-end px-1"
              style={{ left: second * zoom }}
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
          style={{ left: playhead * zoom }}
        >
          <div
            className="absolute -left-2 top-0 w-4 h-4 bg-primary-500 rounded-t-[2px] border-2 border-hypit-950"
          />
        </div>
      </div>

      {/* Track Lanes */}
      <div
        className="absolute top-8 left-0 right-0 bottom-0 overflow-auto"
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
        style={{ left: playhead * zoom }}
      />

      {/* Zoom indicator */}
      <div className="absolute bottom-2 right-2 bg-hypit-900/80 backdrop-blur px-2 py-1 rounded text-xs text-hypit-400 font-mono">
        {zoom.toFixed(0)}px/s
      </div>
    </div>
  )
}