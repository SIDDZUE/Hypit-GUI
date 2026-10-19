import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import Timeline from '../components/Timeline'
import { Plus, Trash2, Layers, Settings, Eye, EyeOff, Lock, Unlock } from 'lucide-react'
import { clsx } from 'clsx'
import type { Timeline as TimelineType, Track } from '../types'

export default function TimelineEditor() {
  const { timeline, setTimeline, setSelectedElement } = useProjectStore()
  const [showTrackPanel, setShowTrackPanel] = useState(true)
  const [newTrackName, setNewTrackName] = useState('')
  const [newTrackType, setNewTrackType] = useState<'visual' | 'audio' | 'typo'>('visual')

  // Initialize default timeline if none exists
  if (!timeline) {
    const defaultTimeline: TimelineType = {
      id: 'main-timeline',
      name: 'Main Timeline',
      clock: 'main-clock',
      frameRate: 30,
      tracks: [
        {
          id: 'track-video',
          name: 'Video',
          type: 'visual',
          clips: [],
          isVisible: true,
          isLocked: false,
          order: 0,
        },
        {
          id: 'track-audio',
          name: 'Audio',
          type: 'audio',
          clips: [],
          isVisible: true,
          isLocked: false,
          order: 1,
        },
        {
          id: 'track-captions',
          name: 'Captions',
          type: 'typo',
          clips: [],
          isVisible: true,
          isLocked: false,
          order: 2,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setTimeline(defaultTimeline)
  }

  const handleAddTrack = () => {
    if (!timeline || !newTrackName.trim()) return
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: newTrackName,
      type: newTrackType,
      clips: [],
      isVisible: true,
      isLocked: false,
      order: timeline.tracks.length,
    }
    setTimeline({
      ...timeline,
      tracks: [...timeline.tracks, newTrack],
      updatedAt: new Date().toISOString(),
    })
    setNewTrackName('')
  }

  const handleDeleteTrack = (trackId: string) => {
    if (!timeline) return
    if (confirm('Delete this track and all its clips?')) {
      setTimeline({
        ...timeline,
        tracks: timeline.tracks.filter(t => t.id !== trackId).map((t, i) => ({ ...t, order: i })),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const handleTrackVisibilityChange = (trackId: string, isVisible: boolean) => {
    if (!timeline) return
    setTimeline({
      ...timeline,
      tracks: timeline.tracks.map(t =>
        t.id === trackId ? { ...t, isVisible } : t
      ),
      updatedAt: new Date().toISOString(),
    })
  }

  const handleTrackLockChange = (trackId: string, isLocked: boolean) => {
    if (!timeline) return
    setTimeline({
      ...timeline,
      tracks: timeline.tracks.map(t =>
        t.id === trackId ? { ...t, isLocked } : t
      ),
      updatedAt: new Date().toISOString(),
    })
  }

  const handleReorderTracks = (fromIndex: number, toIndex: number) => {
    if (!timeline) return
    const newTracks = [...timeline.tracks]
    const [removed] = newTracks.splice(fromIndex, 1)
    newTracks.splice(toIndex, 0, removed)
    setTimeline({
      ...timeline,
      tracks: newTracks.map((t, i) => ({ ...t, order: i })),
      updatedAt: new Date().toISOString(),
    })
  }

  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'visual': return <Layers className="w-4 h-4 text-primary-400" />
      case 'audio': return <Settings className="w-4 h-4 text-accent-400" />
      case 'typo': return <Settings className="w-4 h-4 text-green-400" />
    }
  }

  const getTrackColor = (type: Track['type']) => {
    switch (type) {
      case 'visual': return 'border-l-3 border-l-primary-500'
      case 'audio': return 'border-l-3 border-l-accent-500'
      case 'typo': return 'border-l-3 border-l-green-500'
    }
  }

  return (
    <div className="flex h-full flex-col bg-hypit-950">
      {/* Toolbar */}
      <div className="flex h-10 items-center gap-2 px-3 border-b border-hypit-800 bg-hypit-900">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTrackPanel(!showTrackPanel)}
            className={clsx('btn-ghost p-1.5', showTrackPanel && 'bg-primary-600/20 text-primary-400')}
            title="Toggle Track Panel"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-hypit-700 mx-1" />

        {showTrackPanel && (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTrackName}
              onChange={(e) => setNewTrackName(e.target.value)}
              placeholder="Track name..."
              className="input w-40 text-sm py-1.5"
            />
            <select
              value={newTrackType}
              onChange={(e) => setNewTrackType(e.target.value as 'visual' | 'audio' | 'typo')}
              className="input w-32 text-sm py-1.5 bg-hypit-800"
            >
              <option value="visual">Visual</option>
              <option value="audio">Audio</option>
              <option value="typo">Typography</option>
            </select>
            <button onClick={handleAddTrack} className="btn-primary px-3 py-1.5 text-sm gap-1">
              <Plus className="w-4 h-4" />
              Add Track
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Track List Panel */}
        {showTrackPanel && (
          <aside className="w-64 border-r border-hypit-800 bg-hypit-900 flex flex-col">
            <div className="p-3 border-b border-hypit-800 flex items-center justify-between">
              <h3 className="font-medium text-hypit-100">Tracks</h3>
              <button
                onClick={() => setShowTrackPanel(false)}
                className="p-1 rounded hover:bg-hypit-800"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {timeline?.tracks.map((track, index) => (
                <div
                  key={track.id}
                  className={clsx(
                    'rounded-lg p-3 transition-all',
                    getTrackColor(track.type),
                    track.isLocked && 'opacity-50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getTrackIcon(track.type)}
                    <input
                      type="text"
                      value={track.name}
                      onChange={(e) => {
                        if (!timeline) return
                        setTimeline({
                          ...timeline,
                          tracks: timeline.tracks.map(t =>
                            t.id === track.id ? { ...t, name: e.target.value } : t
                          ),
                          updatedAt: new Date().toISOString(),
                        })
                      }}
                      className="flex-1 bg-transparent border-none text-sm text-hypit-100 focus:outline-none"
                      disabled={track.isLocked}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleTrackVisibilityChange(track.id, !track.isVisible)}
                        className="p-1 rounded hover:bg-hypit-800 text-hypit-400"
                        title={track.isVisible ? 'Hide' : 'Show'}
                      >
                        {track.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleTrackLockChange(track.id, !track.isLocked)}
                        className="p-1 rounded hover:bg-hypit-800 text-hypit-400"
                        title={track.isLocked ? 'Unlock' : 'Lock'}
                      >
                        {track.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="p-1 rounded hover:bg-hypit-800 text-hypit-400 hover:text-red-400"
                        disabled={track.isLocked}
                        title="Delete track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-hypit-500">
                    <span>{track.clips.length} clips</span>
                    <span>{track.isVisible ? 'Visible' : 'Hidden'}</span>
                  </div>
                </div>
              ))}
              {!timeline?.tracks.length && (
                <p className="text-hypit-500 text-sm text-center py-4">No tracks</p>
              )}
            </div>
          </aside>
        )}

        {/* Timeline */}
        <div className="flex-1 min-w-0">
          <Timeline height={500} />
        </div>
      </div>
    </div>
  )
}