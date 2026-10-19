import { useRef, useEffect, useState } from 'react'
import { Trash2, Copy, Edit } from 'lucide-react'
import { useProjectStore } from '../store/projectStore'
import { clsx } from 'clsx'
import type { Clip as ClipType, Track } from '../types'

interface ClipProps {
  clip: ClipType
  track: Track
  zoom: number
  scrollX: number
  playhead: number
  isDragging: boolean
  onDragStart: (clipId: string, startX: number, clipStartTime: number) => void
  onResizeStart: (clipId: string, startX: number, clipEndTime: number, isLeft: boolean) => void
}

export default function Clip({
  clip,
  track,
  zoom,
  scrollX,
  playhead,
  isDragging,
  onDragStart,
  onResizeStart,
}: ClipProps) {
  const { updateTrack, timeline } = useProjectStore()
  const clipRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 })

  const clipWidth = (clip.endTime - clip.startTime) * zoom
  const clipLeft = clip.startTime * zoom - scrollX
  const isPlayheadOverClip = playhead >= clip.startTime && playhead <= clip.endTime

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget) return
    if (track.isLocked) return
    onDragStart(clip.id, e.clientX, clip.startTime)
  }

  const handleResizeMouseDown = (e: React.MouseEvent, isLeft: boolean) => {
    e.stopPropagation()
    if (track.isLocked) return
    onResizeStart(clip.id, e.clientX, isLeft ? clip.startTime : clip.endTime, isLeft)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuPos({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
  }

  const handleDelete = () => {
    if (!timeline) return
    updateTrack(track.id, {
      clips: track.clips.filter((c: ClipType) => c.id !== clip.id),
    })
    setShowContextMenu(false)
  }

  const handleDuplicate = () => {
    if (!timeline) return
    const newClip: ClipType = {
      ...clip,
      id: `clip-${Date.now()}`,
      startTime: clip.endTime,
      endTime: clip.endTime + (clip.endTime - clip.startTime),
    }
    updateTrack(track.id, {
      clips: [...track.clips, newClip],
    })
    setShowContextMenu(false)
  }

  const handleEdit = () => {
    // Open in editor or inspector
    setShowContextMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false)
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showContextMenu])

  const getClipColor = () => {
    if (clip.componentId) return 'bg-primary-500/30 border-primary-400'
    if (!clip.isEnabled) return 'bg-hypit-700/50 border-hypit-600'
    return 'bg-accent-500/30 border-accent-400'
  }

  return (
    <>
      <div
        ref={clipRef}
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 rounded border-2 cursor-pointer transition-all',
          'flex items-center overflow-hidden select-none',
          getClipColor(),
          isDragging && 'shadow-lg shadow-primary-500/20 z-20 scale-[1.02]',
          isPlayheadOverClip && 'ring-2 ring-primary-500/50',
          !clip.isEnabled && 'opacity-50',
          track.isLocked && 'cursor-not-allowed'
        )}
        style={{
          left: clipLeft,
          width: Math.max(clipWidth, 20),
          height: '85%',
          minWidth: 20,
        }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleEdit}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-primary-500/50 transition-colors"
          style={{ opacity: isHovered || clipWidth < 40 ? 0 : 1 }}
          onMouseDown={(e) => handleResizeMouseDown(e, true)}
        />

        {/* Clip content */}
        <div className="flex-1 px-2 py-1 flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-hypit-100 truncate whitespace-nowrap">
            {clip.name}
          </span>
          {clip.componentId && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary-500/20 text-primary-300 rounded border border-primary-500/30">
              Component
            </span>
          )}
          <span className="text-[10px] text-hypit-400 font-mono whitespace-nowrap">
            {clip.startTime.toFixed(2)}s - {clip.endTime.toFixed(2)}s
          </span>
        </div>

        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize hover:bg-primary-500/50 transition-colors"
          style={{ opacity: isHovered || clipWidth < 40 ? 0 : 1 }}
          onMouseDown={(e) => handleResizeMouseDown(e, false)}
        />

        {/* Playhead indicator within clip */}
        {isPlayheadOverClip && (
          <div
            className="absolute top-0 bottom-0 w-px bg-primary-500/80 pointer-events-none"
            style={{ left: (playhead - clip.startTime) * zoom }}
          />
        )}
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <div
          className="fixed z-50 panel rounded-lg shadow-lg border border-hypit-700 py-1 min-w-[160px]"
          style={{ left: contextMenuPos.x, top: contextMenuPos.y }}
        >
          <button
            onClick={handleEdit}
            className="w-full px-3 py-2 text-left text-sm text-hypit-100 hover:bg-hypit-800 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Clip
          </button>
          <button
            onClick={handleDuplicate}
            className="w-full px-3 py-2 text-left text-sm text-hypit-100 hover:bg-hypit-800 flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <hr className="my-1 border-hypit-700" />
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </>
  )
}