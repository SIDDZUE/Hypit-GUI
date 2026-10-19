import { useEffect, useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import MonacoEditor from '../components/MonacoEditor'
import { Save, RotateCcw, RotateCw, FileText, Search, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import type { Script, FileContent } from '../types'

export default function ScriptEditor() {
  const { script, setScript, openFiles, activeFileId, setActiveFile, openFile, markFileSaved, closeFile } = useProjectStore()
  const [editorContent, setEditorContent] = useState('')
  const [showFileTree, setShowFileTree] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize with default script if none exists
  useEffect(() => {
    if (!script && editorContent === '') {
      const defaultScript: Script = {
        id: 'main-script',
        name: 'Main Script',
        content: `<?svml version="1.0"?>
<svml>
  <import source="studio" as="studio" />
  <time:Clock id="main-clock" frame-rate="30" />
  <time:Timeline clock="main-clock" end="30s" />

  <visual:Track id="video-track" name="Video" />
  <audio:Track id="audio-track" name="Audio" />
  <typo:Flow id="captions" name="Captions" track="video-track" />

  <!-- Define your composition here -->
  <script>
    <!-- Main content goes here -->
  </script>
</svml>`,
        language: 'svml',
        clock: 'main-clock',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setScript(defaultScript)
      setEditorContent(defaultScript.content)
    } else if (script) {
      setEditorContent(script.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [script, setScript])

  const handleContentChange = (content: string) => {
    setEditorContent(content)
    if (script) {
      setScript({ ...script, content, updatedAt: new Date().toISOString() })
    }
  }

  const handleSave = () => {
    if (activeFileId) {
      markFileSaved(activeFileId)
    }
    console.log('Script saved')
  }

  const handleNewFile = () => {
    const newFile: FileContent = {
      path: `script-${Date.now()}.svml`,
      content: `<?svml version="1.0"?>
<svml>
  <time:Clock id="clock" frame-rate="30" />
  <time:Timeline clock="clock" end="30s" />
  <visual:Track id="track-1" name="Track 1" />
</svml>`,
      language: 'svml',
      isDirty: true,
      lastModified: new Date().toISOString(),
    }
    openFile(newFile)
  }

  const handleOpenFile = (filePath: string) => {
    const file = openFiles.get(filePath)
    if (file) {
      setActiveFile(filePath)
      setEditorContent(file.content)
    }
  }

  const filteredFiles = Array.from(openFiles.entries()).filter(([path]) =>
    path.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col bg-hypit-950">
      {/* Toolbar */}
      <div className="flex h-10 items-center gap-2 px-3 border-b border-hypit-800 bg-hypit-900">
        <div className="flex items-center gap-1">
          <button onClick={handleNewFile} className="btn-ghost p-1.5" title="New File (Ctrl+N)">
            <FileText className="w-4 h-4" />
          </button>
          <button onClick={handleSave} className="btn-ghost p-1.5" title="Save (Ctrl+S)">
            <Save className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-hypit-700 mx-1" />

        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hypit-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="input w-full pl-10 pr-4 py-1.5 text-sm bg-hypit-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="btn-ghost p-1.5" title="Undo"><RotateCcw className="w-4 h-4" /></button>
          <button className="btn-ghost p-1.5" title="Redo"><RotateCw className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* File Tree Sidebar */}
        {showFileTree && (
          <aside className="w-64 border-r border-hypit-800 bg-hypit-900 flex flex-col">
            <div className="p-3 border-b border-hypit-800 flex items-center justify-between">
              <h3 className="font-medium text-hypit-100">Files</h3>
              <button
                onClick={() => setShowFileTree(false)}
                className="p-1 rounded hover:bg-hypit-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredFiles.map(([path, file]) => (
                <button
                  key={path}
                  onClick={() => handleOpenFile(path)}
                  className={clsx(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2',
                    activeFileId === path
                      ? 'bg-primary-600/20 text-primary-400'
                      : 'text-hypit-400 hover:bg-hypit-800 hover:text-hypit-100'
                  )}
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1">{path.split('/').pop()}</span>
                  {file.isDirty && <span className="text-yellow-400 text-xs">●</span>}
                </button>
              ))}
              {filteredFiles.length === 0 && (
                <p className="text-hypit-500 text-sm text-center py-4">No open files</p>
              )}
            </div>
          </aside>
        )}

        {/* Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="flex h-8 items-center px-3 border-b border-hypit-800 bg-hypit-900 overflow-x-auto">
            {Array.from(openFiles.entries()).map(([path, file]) => (
              <button
                key={path}
                onClick={() => handleOpenFile(path)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 text-sm rounded-t-lg transition-colors whitespace-nowrap',
                  activeFileId === path
                    ? 'bg-hypit-950 text-hypit-100 border-b-2 border-primary-500'
                    : 'text-hypit-400 hover:bg-hypit-800 hover:text-hypit-100'
                )}
              >
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{path.split('/').pop()}</span>
                {file.isDirty && <span className="text-yellow-400">●</span>}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeFile(path)
                  }}
                  className="p-0.5 rounded hover:bg-hypit-700 text-hypit-500 hover:text-hypit-300"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </button>
            ))}
            {openFiles.size === 0 && (
              <button onClick={handleNewFile} className="btn-ghost px-3 py-1.5 text-sm">
                <Plus className="w-4 h-4 mr-1" />
                New File
              </button>
            )}
          </div>

          {/* Editor Area */}
          <div className="flex-1 min-h-0 relative">
            <MonacoEditor
              language="svml"
              onChange={handleContentChange}
            />

            {/* Empty state when no file */}
            {openFiles.size === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-hypit-500 p-8">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-hypit-300 mb-2">No file open</h3>
                <p className="text-sm mb-6">Create a new script file to start authoring</p>
                <button onClick={handleNewFile} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  New Script File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toggle file tree button when collapsed */}
        {!showFileTree && (
          <button
            onClick={() => setShowFileTree(true)}
            className="w-8 flex items-center justify-center border-r border-hypit-800 bg-hypit-900 hover:bg-hypit-800"
            aria-label="Show file tree"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}