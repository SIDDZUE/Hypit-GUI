import { useProjectStore } from '../store/projectStore'
import { Save, RotateCcw, RotateCw, Play, Square, Maximize2, Minimize2, Menu } from 'lucide-react'
import { clsx } from 'clsx'

interface HeaderProps {
  onToggleSidebar: () => void
  onToggleInspector: () => void
  onTogglePreview: () => void
  inspectorOpen: boolean
  previewOpen: boolean
}

export default function Header({
  onToggleSidebar,
  onToggleInspector,
  onTogglePreview,
  inspectorOpen,
  previewOpen,
}: HeaderProps) {
  const { activeFileId, openFiles, currentProject, markFileSaved } = useProjectStore()
  const activeFile = activeFileId ? openFiles.get(activeFileId) : null
  const hasUnsavedChanges = activeFile?.isDirty

  const handleSave = () => {
    if (activeFileId) {
      markFileSaved(activeFileId)
    }
  }

  const handleSaveAll = () => {
    openFiles.forEach((_, fileId) => {
      markFileSaved(fileId)
    })
  }

  return (
    <header className="flex h-12 items-center justify-between px-4 border-b border-hypit-800 bg-hypit-900/80 backdrop-blur-sm z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-hypit-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {currentProject && (
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-hypit-400">Project:</span>
            <span className="font-medium text-hypit-100 truncate max-w-[200px]">
              {currentProject.name}
            </span>
            {hasUnsavedChanges && (
              <span className="text-yellow-400 text-xs">● Unsaved</span>
            )}
          </div>
        )}

        {activeFile && (
          <div className="hidden md:flex items-center gap-2 text-sm text-hypit-400">
            <span className="truncate max-w-[300px]">{activeFile.path.split('/').pop()}</span>
            {hasUnsavedChanges && <span className="text-yellow-400">●</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={clsx(
            'btn-primary px-3 py-1.5 text-sm gap-1',
            !hasUnsavedChanges && 'opacity-50 cursor-not-allowed'
          )}
          title="Save (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>

        <button
          onClick={handleSaveAll}
          className="btn-secondary px-3 py-1.5 text-sm gap-1"
          title="Save All (Ctrl+Shift+S)"
        >
          <Save className="w-4 h-4" />
          <span className="hidden sm:inline">Save All</span>
        </button>

        <div className="w-px h-6 bg-hypit-700 mx-1" />

        <div className="flex items-center gap-1 bg-hypit-800 rounded-lg p-1">
          <button
            className="btn-ghost p-1.5"
            title="Undo (not implemented yet)"
            aria-label="Undo"
            disabled
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            className="btn-ghost p-1.5"
            title="Redo (not implemented yet)"
            aria-label="Redo"
            disabled
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-hypit-700 mx-1" />

        <div className="flex items-center gap-1 bg-hypit-800 rounded-lg p-1">
          <button
            className={clsx('btn-ghost p-1.5', previewOpen && 'bg-primary-600/20 text-primary-400')}
            onClick={onTogglePreview}
            title="Toggle Preview (Ctrl+P)"
            aria-label="Toggle Preview"
            aria-pressed={previewOpen}
          >
            <Play className="w-4 h-4" />
          </button>
          <button
            className={clsx('btn-ghost p-1.5', inspectorOpen && 'bg-primary-600/20 text-primary-400')}
            onClick={onToggleInspector}
            title="Toggle Inspector (Ctrl+I)"
            aria-label="Toggle Inspector"
            aria-pressed={inspectorOpen}
          >
            {inspectorOpen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="w-px h-6 bg-hypit-700 mx-1" />

        <button
          className="btn-secondary px-3 py-1.5 text-sm gap-1"
          title="Studio integration is not available yet"
          disabled
        >
          <Square className="w-4 h-4" />
          <span className="hidden sm:inline">Studio</span>
        </button>
      </div>
    </header>
  )
}