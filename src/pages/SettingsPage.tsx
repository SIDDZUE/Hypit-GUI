import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { Save, RotateCcw, Key, Monitor, Palette, Database, Terminal, Globe, Shield } from 'lucide-react'
import { clsx } from 'clsx'
import type { Settings } from '../types'

const defaultSettings: Settings = {
  appearance: {
    theme: 'dark',
    accentColor: 'primary',
    fontSize: 13,
    fontFamily: 'JetBrains Mono, Fira Code, monospace',
    density: 'comfortable',
  },
  editor: {
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    minimap: false,
    lineNumbers: 'on',
    formatOnSave: true,
    autoSave: true,
    autoSaveDelay: 1000,
  },
  timeline: {
    defaultDuration: 30,
    snapToGrid: true,
    gridSize: 1,
    showTimecode: true,
    showFrames: false,
    trackHeight: 60,
    playheadColor: '#EF4444',
  },
  preview: {
    autoPlay: false,
    loop: false,
    quality: 'high',
    showGuides: true,
    showSafeArea: false,
  },
  build: {
    defaultOutputFormat: 'mp4',
    defaultQuality: 'high',
    ffmpegPath: '',
    parallelJobs: 4,
    cleanupTempFiles: true,
  },
  studio: {
    host: 'localhost',
    port: 3001,
    autoConnect: false,
    reconnectAttempts: 3,
    reconnectDelay: 1000,
  },
  shortcuts: {
    save: 'Ctrl+S',
    saveAll: 'Ctrl+Shift+S',
    undo: 'Ctrl+Z',
    redo: 'Ctrl+Shift+Z',
    playPause: 'Space',
    nextFrame: 'ArrowRight',
    prevFrame: 'ArrowLeft',
    zoomIn: 'Ctrl+=',
    zoomOut: 'Ctrl+-',
    toggleSidebar: 'Ctrl+B',
    toggleInspector: 'Ctrl+I',
    togglePreview: 'Ctrl+P',
  },
}

const ACCENT_COLORS: Record<string, string> = {
  primary: '#3b82f6',
  accent: '#d946ef',
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  orange: '#f97316',
  pink: '#ec4899',
  red: '#ef4444',
}

export default function SettingsPage() {
  const { settings, setSettings } = useProjectStore()
  const [activeSection, setActiveSection] = useState<keyof Settings>('appearance')
  const [localSettings, setLocalSettings] = useState<Settings>(settings || defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const sections: { key: keyof Settings; label: string; icon: React.ReactNode }[] = [
    { key: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { key: 'editor', label: 'Editor', icon: <Terminal className="w-5 h-5" /> },
    { key: 'timeline', label: 'Timeline', icon: <Monitor className="w-5 h-5" /> },
    { key: 'preview', label: 'Preview', icon: <Globe className="w-5 h-5" /> },
    { key: 'build', label: 'Build & Export', icon: <Database className="w-5 h-5" /> },
    { key: 'studio', label: 'Studio', icon: <Shield className="w-5 h-5" /> },
    { key: 'shortcuts', label: 'Shortcuts', icon: <Key className="w-5 h-5" /> },
  ]

  const handleChange = (section: keyof Settings, updates: Partial<Settings[keyof Settings]>) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    setSettings(localSettings)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalSettings(defaultSettings)
    setHasChanges(true)
  }

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Theme</h4>
        <div className="grid grid-cols-3 gap-3">
          {['dark', 'light', 'system'].map((theme) => (
            <button
              key={theme}
              onClick={() => handleChange('appearance', { theme: theme as Settings['appearance']['theme'] })}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all',
                localSettings.appearance.theme === theme
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-hypit-700 hover:border-hypit-600'
              )}
            >
              <div className="w-full h-16 rounded mb-2 bg-hypit-800" />
              <span className="capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Accent Color</h4>
        <div className="flex flex-wrap gap-2">
          {['primary', 'accent', 'blue', 'green', 'purple', 'orange', 'pink', 'red'].map((color) => (
            <button
              key={color}
              onClick={() => handleChange('appearance', { accentColor: color })}
              aria-label={`${color} accent color`}
              aria-pressed={localSettings.appearance.accentColor === color}
              className={clsx(
                'w-10 h-10 rounded-lg border-2 transition-transform',
                'hover:scale-110',
                localSettings.appearance.accentColor === color
                  ? 'border-white'
                  : 'border-transparent'
              )}
              style={{
                backgroundColor: ACCENT_COLORS[color],
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Font Size</h4>
        <input
          type="number"
          value={localSettings.appearance.fontSize}
          onChange={(e) => handleChange('appearance', { fontSize: Number(e.target.value) })}
          className="input w-full max-w-xs"
          min={10}
          max={24}
        />
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Font Family</h4>
        <input
          type="text"
          value={localSettings.appearance.fontFamily}
          onChange={(e) => handleChange('appearance', { fontFamily: e.target.value })}
          className="input font-mono text-sm w-full max-w-md"
        />
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Density</h4>
        <select
          value={localSettings.appearance.density}
          onChange={(e) => handleChange('appearance', { density: e.target.value as Settings['appearance']['density'] })}
          className="input bg-hypit-800 w-full max-w-xs"
        >
          <option value="compact">Compact</option>
          <option value="comfortable">Comfortable</option>
          <option value="spacious">Spacious</option>
        </select>
      </div>
    </div>
  )

  const renderEditorSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Font</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Tab Size</label>
            <input
              type="number"
              value={localSettings.editor.tabSize}
              onChange={(e) => handleChange('editor', { tabSize: Number(e.target.value) })}
              className="input"
              min={1}
              max={8}
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Line Numbers</label>
            <select
              value={localSettings.editor.lineNumbers}
              onChange={(e) => handleChange('editor', { lineNumbers: e.target.value as Settings['editor']['lineNumbers'] })}
              className="input bg-hypit-800"
            >
              <option value="on">On</option>
              <option value="off">Off</option>
              <option value="relative">Relative</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Word Wrap</label>
            <select
              value={localSettings.editor.wordWrap}
              onChange={(e) => handleChange('editor', { wordWrap: e.target.value as Settings['editor']['wordWrap'] })}
              className="input bg-hypit-800"
            >
              <option value="on">On</option>
              <option value="off">Off</option>
              <option value="bounded">Bounded</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Behavior</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.editor.insertSpaces}
              onChange={(e) => handleChange('editor', { insertSpaces: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Insert spaces instead of tabs</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.editor.minimap}
              onChange={(e) => handleChange('editor', { minimap: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show minimap</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.editor.formatOnSave}
              onChange={(e) => handleChange('editor', { formatOnSave: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Format on save</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.editor.autoSave}
              onChange={(e) => handleChange('editor', { autoSave: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Auto-save</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Auto-save Delay (ms)</h4>
        <input
          type="number"
          value={localSettings.editor.autoSaveDelay}
          onChange={(e) => handleChange('editor', { autoSaveDelay: Number(e.target.value) })}
          className="input w-full max-w-xs"
          min={100}
          max={10000}
          step={100}
        />
      </div>
    </div>
  )

  const renderTimelineSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Default View</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Default Duration (s)</label>
            <input
              type="number"
              value={localSettings.timeline.defaultDuration}
              onChange={(e) => handleChange('timeline', { defaultDuration: Number(e.target.value) })}
              className="input"
              min={1}
              max={3600}
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Grid Size (s)</label>
            <input
              type="number"
              value={localSettings.timeline.gridSize}
              onChange={(e) => handleChange('timeline', { gridSize: Number(e.target.value) })}
              className="input"
              min={0.1}
              max={10}
              step={0.1}
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Track Height (px)</label>
            <input
              type="number"
              value={localSettings.timeline.trackHeight}
              onChange={(e) => handleChange('timeline', { trackHeight: Number(e.target.value) })}
              className="input"
              min={30}
              max={200}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Behavior</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.timeline.snapToGrid}
              onChange={(e) => handleChange('timeline', { snapToGrid: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Snap to grid</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.timeline.showTimecode}
              onChange={(e) => handleChange('timeline', { showTimecode: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show timecode</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.timeline.showFrames}
              onChange={(e) => handleChange('timeline', { showFrames: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show frames</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Playhead Color</h4>
        <input
          type="color"
          value={localSettings.timeline.playheadColor}
          onChange={(e) => handleChange('timeline', { playheadColor: e.target.value })}
          className="w-10 h-10 rounded border border-hypit-600 cursor-pointer"
        />
      </div>
    </div>
  )

  const renderPreviewSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Playback</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.preview.autoPlay}
              onChange={(e) => handleChange('preview', { autoPlay: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Auto-play on load</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.preview.loop}
              onChange={(e) => handleChange('preview', { loop: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Loop playback</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.preview.showSafeArea}
              onChange={(e) => handleChange('preview', { showSafeArea: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show safe area</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.preview.showGuides}
              onChange={(e) => handleChange('preview', { showGuides: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show guides</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Quality</h4>
        <div>
          <label className="block text-sm text-hypit-400 mb-1">Preview Quality</label>
          <select
            value={localSettings.preview.quality}
            onChange={(e) => handleChange('preview', { quality: e.target.value as Settings['preview']['quality'] })}
            className="input bg-hypit-800 w-full max-w-xs"
          >
            <option value="low">Low (faster)</option>
            <option value="medium">Medium</option>
            <option value="high">High (slower)</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderBuildSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Output</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Default Format</label>
            <select
              value={localSettings.build.defaultOutputFormat}
              onChange={(e) => handleChange('build', { defaultOutputFormat: e.target.value as Settings['build']['defaultOutputFormat'] })}
              className="input bg-hypit-800"
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="gif">GIF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Default Quality</label>
            <select
              value={localSettings.build.defaultQuality}
              onChange={(e) => handleChange('build', { defaultQuality: e.target.value as Settings['build']['defaultQuality'] })}
              className="input bg-hypit-800"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="lossless">Lossless</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">FFmpeg Path (optional)</label>
            <input
              type="text"
              value={localSettings.build.ffmpegPath}
              onChange={(e) => handleChange('build', { ffmpegPath: e.target.value })}
              className="input font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Parallel Jobs</label>
            <input
              type="number"
              value={localSettings.build.parallelJobs}
              onChange={(e) => handleChange('build', { parallelJobs: Number(e.target.value) })}
              className="input"
              min={1}
              max={16}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Behavior</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.build.cleanupTempFiles}
              onChange={(e) => handleChange('build', { cleanupTempFiles: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Cleanup temp files after build</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderStudioSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Connection</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Host</label>
            <input
              type="text"
              value={localSettings.studio.host}
              onChange={(e) => handleChange('studio', { host: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Port</label>
            <input
              type="number"
              value={localSettings.studio.port}
              onChange={(e) => handleChange('studio', { port: Number(e.target.value) })}
              className="input"
              min={1}
              max={65535}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Behavior</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.studio.autoConnect}
              onChange={(e) => handleChange('studio', { autoConnect: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Auto-connect on startup</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.studio.reconnectAttempts > 0}
              onChange={(e) => handleChange('studio', { reconnectAttempts: e.target.checked ? 3 : 0 })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Auto-reconnect</span>
          </label>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Reconnect Delay (ms)</h4>
        <input
          type="number"
          value={localSettings.studio.reconnectDelay}
          onChange={(e) => handleChange('studio', { reconnectDelay: Number(e.target.value) })}
          className="input w-full max-w-xs"
          min={100}
          max={10000}
          step={100}
        />
      </div>

      <div className="panel p-4 border-hypit-700/50">
        <p className="text-sm text-hypit-400">
          Studio connection settings are used to connect to the Hypit Studio server for live preview and build execution.
          Make sure the Studio server is running before connecting.
        </p>
      </div>
    </div>
  )

  const renderShortcutsSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-hypit-100">Keyboard Shortcuts</h4>
        <button onClick={handleReset} className="btn-ghost text-sm">
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset to Defaults
        </button>
      </div>
      <div className="space-y-2">
        {Object.entries(localSettings.shortcuts).map(([action, shortcut]) => (
          <div key={action} className="flex items-center justify-between p-3 bg-hypit-800/50 rounded-lg">
            <span className="text-hypit-300 capitalize">{action.replace(/([A-Z])/g, ' $1').trim()}</span>
            <kbd className="px-3 py-1 bg-hypit-900 rounded border border-hypit-700 font-mono text-sm text-hypit-100">
              {shortcut}
            </kbd>
          </div>
        ))}
      </div>
      <div className="panel p-4 border-hypit-700/50">
        <p className="text-sm text-hypit-400">
          Shortcut customization is not yet implemented. This will be available in a future version.
        </p>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'appearance': return renderThemeSettings()
      case 'editor': return renderEditorSettings()
      case 'timeline': return renderTimelineSettings()
      case 'preview': return renderPreviewSettings()
      case 'build': return renderBuildSettings()
      case 'studio': return renderStudioSettings()
      case 'shortcuts': return renderShortcutsSettings()
      default: return null
    }
  }

  return (
    <div className="flex h-full flex-col bg-hypit-950">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-hypit-800 bg-hypit-900">
        <div>
          <h1 className="text-2xl font-bold text-hypit-100">Settings</h1>
          <p className="text-hypit-400">Configure your Hypit GUI preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="btn-secondary" disabled={!hasChanges}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </button>
          <button onClick={handleSave} className="btn-primary" disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" />
            Save Settings
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-56 border-r border-hypit-800 bg-hypit-900 flex flex-col">
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                  activeSection === section.key
                    ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                    : 'text-hypit-400 hover:bg-hypit-800 hover:text-hypit-100'
                )}
              >
                <span className="flex-shrink-0">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}