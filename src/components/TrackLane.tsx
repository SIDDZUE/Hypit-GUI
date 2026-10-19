import { useState, useCallback, useEffect } from 'react'
import Clip from './Clip'
import { useProjectStore } from '../store/projectStore'
import { Plus, Trash2, Eye, EyeOff, Lock, Unlock, GripVertical } from 'lucide-react'
import { clsx } from 'clsx'
import type { Track, Clip as ClipType } from '../types'

interface TrackLaneProps {
  track: Track
  zoom: number
  scrollX: number
  playhead: number
  duration: number
}

export default function TrackLane({ track, zoom, scrollX, playhead, duration }: TrackLaneProps) {
  const { timeline, updateTrack } = useProjectStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDraggingClip, setIsDraggingClip] = useState<string | null>(null)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartTime, setDragStartTime] = useState(0)

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

  const handleClipDragStart = (clipId: string, startX: number, clipStartTime: number) => {
    setIsDraggingClip(clipId)
    setDragStartX(startX)
    setDragStartTime(clipStartTime)
  }

  const handleClipDrag = (clientX: number) => {
    if (isDraggingClip === null) return
    const deltaX = clientX - dragStartX
    const deltaTime = deltaX / zoom
    const newStartTime = Math.max(0, dragStartTime + deltaTime)
    const clip = track.clips.find(c => c.id === isDraggingClip)
    if (clip && newStartTime + (clip.endTime - clip.startTime) <= duration) {
      updateTrack(track.id, {
        clips: track.clips.map(c =>
          c.id === isDraggingClip
            ? { ...c, startTime: newStartTime, endTime: newStartTime + (clip.endTime - clip.startTime) }
            : c
        ),
      })
    }
  }

  const handleClipDragEnd = () => {
    setIsDraggingClip(null)
  }

  const handleResizeStart = (clipId: string, startX: number, clipEndTime: number, isLeft: boolean) => {
    setIsDraggingClip(`${clipId}-${isLeft ? 'left' : 'right'}`)
    setDragStartX(startX)
    setDragStartTime(clipEndTime)
  }

  const handleResize = (clientX: number) => {
    if (!isDraggingClip || !isDraggingClip.includes('-')) return
    const [clipId, side] = isDraggingClip.split('-')
    const deltaX = clientX - dragStartX
    const deltaTime = deltaX / zoom
    const clip = track.clips.find(c => c.id === clipId)
    if (!clip) return

    if (side === 'left') {
      const newStartTime = Math.max(0, dragStartTime + deltaTime)
      if (newStartTime < clip.endTime - 0.1) {
        updateTrack(track.id, {
          clips: track.clips.map(c =>
            c.id === clipId ? { ...c, startTime: newStartTime } : c
          ),
        })
      }
    } else {
      const newEndTime = Math.min(duration, dragStartTime + deltaTime)
      if (newEndTime > clip.startTime + 0.1) {
        updateTrack(track.id, {
          clips: track.clips.map(c =>
            c.id === clipId ? { ...c, endTime: newEndTime } : c
          ),
        })
      }
    }
  }

  const handleResizeEnd = () => {
    setIsDraggingClip(null)
  }

  useEffect(() => {
    if (isDraggingClip) {
      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingClip.includes('-')) {
          handleResize(e.clientX)
        } else {
          handleClipDrag(e.clientX)
        }
      }
      const handleMouseUp = () => handleResizeEnd()
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingClip])

  return (
    <div className="relative border-b border-hypit-800 bg-hypit-900/50">
      {/* Track Header */}
      <div className="flex h-10 items-center gap-2 px-3 border-r border-hypit-800 bg-hypit-900 sticky left-0 z-10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-hypit-800 transition-colors"
          aria-label={isExpanded ? 'Collapse track' : 'Expand track'}
        >
          <GripVertical className={clsx('w-4 h-4', isExpanded ? 'rotate-90' : '')} />
        </button>
        <input
          type="text"
          value={track.name}
          onChange={(e) => updateTrack(track.id, { name: e.target.value })}
          className="flex-1 bg-transparent border-none text-sm text-hypit-100 focus:outline-none"
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
                const newTracks = timeline.tracks.filter(t => t.id !== track.id)
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
        {/* Grid lines */}
        <div className="absolute inset-0" style={{ width: totalWidth }}>
          {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => i).map((second) => (
            <div
              key={second}
              className="absolute top-0 bottom-0 w-px"
              style={{
                left: second * zoom,
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
            isDragging={isDraggingClip === clip.id}
            onDragStart={handleClipDragStart}
            onResizeStart={handleResizeStart}
          />
        ))}

        {/* Drop zone indicator */}
        {!track.isLocked && track.clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-hypit-700 rounded-lg">
            <span className="text-hypit-500 text-sm">Click to add clip</span>
          </div>
        )}
      </div>
    </div>
  )
}