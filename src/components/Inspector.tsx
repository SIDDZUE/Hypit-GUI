import { useProjectStore } from '../store/projectStore'
import { X, FileText, Box, Music, Type } from 'lucide-react'

export default function Inspector() {
  const { activeFileId, openFiles, timeline, components, selectedElement, updateComponent, toggleInspector, setSelectedElement } = useProjectStore()
  const activeFile = activeFileId ? openFiles.get(activeFileId) : null

  if (!activeFile && !selectedElement) {
    return (
      <div className="flex h-full flex-col">
        <div className="panel-header flex items-center justify-between px-4 py-3">
          <h3 className="font-medium text-hypit-100">Inspector</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-hypit-500">
          <p>Select an element to inspect</p>
        </div>
      </div>
    )
  }

  const renderFileInspector = () => {
    if (!activeFile) return null
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-hypit-400" />
          <span className="font-medium text-hypit-100">{activeFile.path.split('/').pop()}</span>
          {activeFile.isDirty && <span className="text-yellow-400 text-xs">● Unsaved</span>}
        </div>
        <div className="text-sm text-hypit-400">
          <p>Path: {activeFile.path}</p>
          <p>Language: {activeFile.language}</p>
          <p>Size: {activeFile.content.length} characters</p>
        </div>
      </div>
    )
  }

  const renderTimelineInspector = () => {
    if (!timeline) return null
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-hypit-400" />
          <h4 className="font-medium text-hypit-100">Timeline</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-hypit-400">
            <span>Clock</span>
            <span className="text-hypit-100">{timeline.clock || 'None'}</span>
          </div>
          <div className="flex justify-between text-hypit-400">
            <span>Frame Rate</span>
            <span className="text-hypit-100">{timeline.frameRate || 30} fps</span>
          </div>
          <div className="flex justify-between text-hypit-400">
            <span>Tracks</span>
            <span className="text-hypit-100">{timeline.tracks.length}</span>
          </div>
        </div>
        <div className="pt-2 border-t border-hypit-800">
          <h5 className="text-xs font-medium text-hypit-500 uppercase tracking-wider mb-2">Tracks</h5>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {timeline.tracks.map((track: { id: string; type: string; name: string; clips: any[] }) => (
              <div
                key={track.id}
                className="flex items-center justify-between px-2 py-1.5 rounded bg-hypit-800/50 text-sm"
              >
                <div className="flex items-center gap-2">
                  {track.type === 'visual' && <Box className="w-4 h-4 text-primary-400" />}
                  {track.type === 'audio' && <Music className="w-4 h-4 text-accent-400" />}
                  {track.type === 'typo' && <Type className="w-4 h-4 text-green-400" />}
                  <span className="truncate max-w-[150px]">{track.name}</span>
                </div>
                <span className="text-hypit-500">{track.clips.length} clips</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderComponentInspector = () => {
    if (!selectedElement || selectedElement.type !== 'component') return null
    const component = components.find(c => c.id === selectedElement.id)
    if (!component) return null

    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-hypit-400" />
          <h4 className="font-medium text-hypit-100">{component.name}</h4>
        </div>
        <div className="text-sm text-hypit-400">
          <p>Type: {component.type}</p>
          <p>Category: {component.category}</p>
        </div>
        <div className="pt-2 border-t border-hypit-800">
          <h5 className="text-xs font-medium text-hypit-500 uppercase tracking-wider mb-2">Properties</h5>
          <div className="space-y-2">
            {Object.entries(component.properties).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-xs text-hypit-400">{key}</label>
                <input
                  type="text"
                  value={String(value)}
                  onChange={(e) =>
                    updateComponent(component.id, {
                      properties: { ...component.properties, [key]: e.target.value },
                      updatedAt: new Date().toISOString(),
                    })
                  }
                  className="input text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderClipInspector = () => {
    if (!selectedElement || selectedElement.type !== 'clip') return null
    // Find clip in timeline
    let clip: any = null
    timeline?.tracks.forEach(track => {
      const found = track.clips.find(c => c.id === selectedElement.id)
      if (found) clip = found
    })
    if (!clip) return null

    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-hypit-400" />
          <h4 className="font-medium text-hypit-100">{clip.name}</h4>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-hypit-400">
            <span>Start Time</span>
            <span className="text-hypit-100">{clip.startTime.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between text-hypit-400">
            <span>End Time</span>
            <span className="text-hypit-100">{clip.endTime.toFixed(2)}s</span>
          </div>
          <div className="flex justify-between text-hypit-400">
            <span>Duration</span>
            <span className="text-hypit-100">{(clip.endTime - clip.startTime).toFixed(2)}s</span>
          </div>
          <div className="flex justify-between text-hypit-400">
            <span>Enabled</span>
            <span className="text-hypit-100">{clip.isEnabled ? 'Yes' : 'No'}</span>
          </div>
        </div>
        {clip.componentId && (
          <div className="pt-2 border-t border-hypit-800">
            <h5 className="text-xs font-medium text-hypit-500 uppercase tracking-wider mb-2">Component</h5>
            <p className="text-sm text-hypit-300">{clip.componentId}</p>
          </div>
        )}
        {Object.keys(clip.properties).length > 0 && (
          <div className="pt-2 border-t border-hypit-800">
            <h5 className="text-xs font-medium text-hypit-500 uppercase tracking-wider mb-2">Properties</h5>
            <div className="space-y-2">
              {Object.entries(clip.properties).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-hypit-400">{key}</span>
                  <span className="text-hypit-100">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-hypit-900">
      <div className="panel-header flex items-center justify-between px-4 py-3">
        <h3 className="font-medium text-hypit-100">Inspector</h3>
        <button
          onClick={() => {
            setSelectedElement(null)
            toggleInspector()
          }}
          className="p-1 rounded hover:bg-hypit-800 transition-colors"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {renderFileInspector()}
        {renderTimelineInspector()}
        {renderComponentInspector()}
        {renderClipInspector()}
      </div>
    </div>
  )
}