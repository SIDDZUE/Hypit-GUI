import { useState, useEffect } from 'react'
import Clip from './Clip'
import { useProjectStore } from '../store/projectStore'
import { Trash2, Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react'
import { clsx } from 'clsx'
import type { Track, Clip as ClipType } from '../types'

interface TrackLaneProps {
  track: Track
  zoom: number
  scrollX: number
  playhead: number
  duration: number
}

const MIN_CLIP_DURATION = 0.1

type DragState =
  | { kind: 'move'; clipId: string; startX: number; originStart: number; originEnd: number }
  | { kind: 'resize'; clipId: string; side: 'left' | 'right'; startX: number; originStart: number; originEnd: number }

export default function TrackLane({ track, zoom, scrollX, playhead, duration }: TrackLaneProps) {
  const { timeline, updateTrack, updateClip } = useProjectStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [dragState, setDragState] = useState<DragState | null>(null)

  const trackHeight = isExpanded ? 120 : 60
  const totalWidth = duration * zoom

  const handleAddClip = () => {
    if (!timeline) return
    const newClip: ClipType = {
      id: `clip-${Date.now()}`,
      trackId: track.id,
      name: 'New Clip',
      startTime: playhead,
      endTime: playhead + 5,
      componentId: undefined,
      properties: {},
      isEnabled: true,
    }
    updateTrack(track.id, {
      clips: [...track.clips, newClip],
    })
  }

  const handleClipDragStart = (clipId: string, startX: number, originStart: number, originEnd: number) => {
    setDragState({ kind: 'move', clipId, startX, originStart, originEnd })
  }

  const handleResizeStart = (clipId: string, startX: number, side: 'left' | 'right', originStart: number, originEnd: number) => {
    setDragState({ kind: 'resize', clipId, side, startX, originStart, originEnd })
  }

  useEffect(() => {
    if (!dragState) return

    const handleMouseMove = (e: MouseEvent) => {
      const deltaTime = (e.clientX - dragState.startX) / zoom

      if (dragState.kind === 'move') {
        const clipLength = dragState.originEnd - dragState.originStart
        const maxStart = Math.max(0, duration - clipLength)
        const newStart = Math.min(Math.max(0, dragState.originStart + deltaTime), maxStart)
        updateClip(track.id, dragState.clipId, {
          startTime: newStart,
          endTime: newStart + clipLength,
        })
      } else if (dragState.side === 'left') {
        const newStart = Math.min(
          Math.max(0, dragState.originStart + deltaTime),
          dragState.originEnd - MIN_CLIP_DURATION
        )
        updateClip(track.id, dragState.clipId, { startTime: newStart })
      } else {
        const newEnd = Math.max(
          Math.min(duration, dragState.originEnd + deltaTime),
          dragState.originStart + MIN_CLIP_DURATION
        )
        updateClip(track.id, dragState.clipId, { endTime: newEnd })
      }
    }

    const handleMouseUp = () => setDragState(null)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragState, zoom, duration, track.id, updateClip])

  return (
    <div className="relative border-b border-hypit-800 bg-hypit-900/50">
      {/* Track Header */}
      <div className="flex h-10 items-center gap-2 px-3 border-r border-hypit-800 bg-hypit-900 sticky left-0 z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-sm hover:bg-hypit-800 transition-colors"
          aria-label={isExpanded ? 'Collapse track' : 'Expand track'}
        >
          <GripVertical className={clsx('w-4 h-4', isExpanded ? 'rotate-90' : '')} />
        </button>
        <input
          type="text"
          value={track.name}
          onChange={(e) => updateTrack(track.id, { name: e.target.value })}
          className="flex-1 bg-transparent border-none text-sm text-hypit-100 focus:outline-hidden"
          aria-label="Track name"
        />
        <div className="flex items-center gap-1">
          <button
            onClick={() => updateTrack(track.id, { isVisible: !track.isVisible })}
            className="btn-ghost p-1.5"
            aria-label={track.isVisible ? 'Hide track' : 'Show track'}
          >
            {track.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => updateTrack(track.id, { isLocked: !track.isLocked })}
            className="btn-ghost p-1.5"
            aria-label={track.isLocked ? 'Unlock track' : 'Lock track'}
          >
            {track.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              if (timeline) {
                const newTracks = timeline.tracks
                  .filter(t => t.id !== track.id)
                  .map((t, i) => ({ ...t, order: i }))
                useProjectStore.getState().setTimeline({ ...timeline, tracks: newTracks })
              }
            }}
            className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
            aria-label="Delete track"
            disabled={track.isLocked}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Track Content */}
      <div
        className="relative overflow-hidden"
        style={{ height: trackHeight }}
        onClick={(e) => {
          if (e.target === e.currentTarget && !track.isLocked) {
            handleAddClip()
          }
        }}
      >
        {/* Grid lines (click-through so the lane below receives clicks) */}
        <div className="absolute inset-0 pointer-events-none" style={{ width: totalWidth }}>
          {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => i).map((second) => (
            <div
              key={second}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: second * zoom - scrollX,
                backgroundColor: second % 5 === 0 ? '#334155' : '#1e293b',
              }}
            />
          ))}
        </div>

        {/* Clips */}
        {track.clips.map((clip) => (
          <Clip
            key={clip.id}
            clip={clip}
            track={track}
            zoom={zoom}
            scrollX={scrollX}
            playhead={playhead}
            isDragging={dragState?.clipId === clip.id}
            onDragStart={handleClipDragStart}
            onResizeStart={handleResizeStart}
          />
        ))}

        {/* Drop zone indicator */}
        {!track.isLocked && track.clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-hypit-700 rounded-lg pointer-events-none">
            <span className="text-hypit-500 text-sm">Click to add clip</span>
          </div>
        )}
      </div>
    </div>
  )
}
