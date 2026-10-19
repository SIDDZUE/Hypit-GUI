import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { Save, RotateCcw, Key, Monitor, Palette, Database, Terminal, Globe, Shield, Bell } from 'lucide-react'
import { clsx } from 'clsx'
import type { Settings } from '../types'

const defaultSettings: Settings = {
  theme: 'dark',
  editor: {
    fontSize: 13,
    fontFamily: 'JetBrains Mono, Fira Code, monospace',
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on',
    minimap: false,
    lineNumbers: 'on',
    bracketPairColorization: true,
    guides: { bracketPairs: true },
  },
  timeline: {
    defaultZoom: 100,
    snapToGrid: true,
    gridInterval: 1,
    showWaveforms: true,
    showThumbnails: true,
  },
  preview: {
    autoPlay: false,
    loopPlayback: false,
    quality: 'high',
    showSafeAreas: false,
  },
  build: {
    outputDir: './dist',
    format: 'mp4',
    codec: 'h264',
    crf: 23,
    preset: 'medium',
    audioCodec: 'aac',
    audioBitrate: '128k',
  },
  studio: {
    host: 'localhost',
    port: 3001,
    autoConnect: false,
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

export default function SettingsPage() {
  const { settings, setSettings } = useProjectStore()
  const [activeSection, setActiveSection] = useState<keyof Settings>('theme')
  const [localSettings, setLocalSettings] = useState<Settings>(settings || defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const sections: { key: keyof Settings; label: string; icon: React.ReactNode }[] = [
    { key: 'theme', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
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
              onClick={() => handleChange('theme', theme as Settings['theme'])}
              className={clsx(
                'p-4 rounded-lg border-2 transition-all',
                localSettings.theme === theme
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
              onClick={() => handleChange('theme', { accentColor: color } as any)}
              className={clsx(
                'w-10 h-10 rounded-lg border-2 transition-transform',
                localSettings.theme === 'dark' && 'hover:scale-110'
              )}
              style={{
                backgroundColor: `var(--color-${color}-500)`,
                borderColor: localSettings.theme === 'dark' ? 'transparent' : 'var(--color-hypit-700)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )

  const renderEditorSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Font</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Font Size</label>
            <input
              type="number"
              value={localSettings.editor.fontSize}
              onChange={(e) => handleChange('editor', { fontSize: Number(e.target.value) })}
              className="input"
              min={10}
              max={24}
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Font Family</label>
            <input
              type="text"
              value={localSettings.editor.fontFamily}
              onChange={(e) => handleChange('editor', { fontFamily: e.target.value })}
              className="input font-mono text-sm"
            />
          </div>
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
              checked={localSettings.editor.wordWrap === 'on'}
              onChange={(e) => handleChange('editor', { wordWrap: e.target.checked ? 'on' : 'off' })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Word wrap</span>
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
              checked={localSettings.editor.bracketPairColorization}
              onChange={(e) => handleChange('editor', { bracketPairColorization: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Bracket pair colorization</span>
          </label>
        </div>
      </div>
    </div>
  )

  const renderTimelineSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Default View</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Default Zoom (px/s)</label>
            <input
              type="number"
              value={localSettings.timeline.defaultZoom}
              onChange={(e) => handleChange('timeline', { defaultZoom: Number(e.target.value) })}
              className="input"
              min={20}
              max={500}
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Grid Interval (s)</label>
            <input
              type="number"
              value={localSettings.timeline.gridInterval}
              onChange={(e) => handleChange('timeline', { gridInterval: Number(e.target.value) })}
              className="input"
              min={0.1}
              max={10}
              step={0.1}
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
              checked={localSettings.timeline.showWaveforms}
              onChange={(e) => handleChange('timeline', { showWaveforms: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show audio waveforms</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.timeline.showThumbnails}
              onChange={(e) => handleChange('timeline', { showThumbnails: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show clip thumbnails</span>
          </label>
        </div>
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
              checked={localSettings.preview.loopPlayback}
              onChange={(e) => handleChange('preview', { loopPlayback: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Loop playback</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localSettings.preview.showSafeAreas}
              onChange={(e) => handleChange('preview', { showSafeAreas: e.target.checked })}
              className="w-4 h-4 rounded border-hypit-600 text-primary-500 focus:ring-primary-500 bg-hypit-800"
            />
            <span className="text-hypit-100">Show safe areas</span>
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
            <label className="block text-sm text-hypit-400 mb-1">Output Directory</label>
            <input
              type="text"
              value={localSettings.build.outputDir}
              onChange={(e) => handleChange('build', { outputDir: e.target.value })}
              className="input font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Format</label>
            <select
              value={localSettings.build.format}
              onChange={(e) => handleChange('build', { format: e.target.value as Settings['build']['format'] })}
              className="input bg-hypit-800"
            >
              <option value="mp4">MP4</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Video Codec</label>
            <select
              value={localSettings.build.codec}
              onChange={(e) => handleChange('build', { codec: e.target.value as Settings['build']['codec'] })}
              className="input bg-hypit-800"
            >
              <option value="h264">H.264</option>
              <option value="h265">H.265 (HEVC)</option>
              <option value="vp9">VP9</option>
              <option value="av1">AV1</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">CRF</label>
            <input
              type="number"
              value={localSettings.build.crf}
              onChange={(e) => handleChange('build', { crf: Number(e.target.value) })}
              className="input"
              min={0}
              max={51}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-hypit-100 mb-3">Encoding</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Preset</label>
            <select
              value={localSettings.build.preset}
              onChange={(e) => handleChange('build', { preset: e.target.value as Settings['build']['preset'] })}
              className="input bg-hypit-800"
            >
              <option value="ultrafast">Ultrafast</option>
              <option value="superfast">Superfast</option>
              <option value="veryfast">Very Fast</option>
              <option value="faster">Faster</option>
              <option value="fast">Fast</option>
              <option value="medium">Medium</option>
              <option value="slow">Slow</option>
              <option value="slower">Slower</option>
              <option value="veryslow">Very Slow</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Audio Codec</label>
            <select
              value={localSettings.build.audioCodec}
              onChange={(e) => handleChange('build', { audioCodec: e.target.value as Settings['build']['audioCodec'] })}
              className="input bg-hypit-800"
            >
              <option value="aac">AAC</option>
              <option value="opus">Opus</option>
              <option value="mp3">MP3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-hypit-400 mb-1">Audio Bitrate</label>
            <select
              value={localSettings.build.audioBitrate}
              onChange={(e) => handleChange('build', { audioBitrate: e.target.value as Settings['build']['audioBitrate'] })}
              className="input bg-hypit-800"
            >
              <option value="64k">64 kbps</option>
              <option value="96k">96 kbps</option>
              <option value="128k">128 kbps</option>
              <option value="192k">192 kbps</option>
              <option value="256k">256 kbps</option>
              <option value="320k">320 kbps</option>
            </select>
          </div>
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
        </div>
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
      case 'theme': return renderThemeSettings()
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