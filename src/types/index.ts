export interface Project {
  id: string
  name: string
  path: string
  createdAt: string
  updatedAt: string
  settings: ProjectSettings
}

export interface ProjectSettings {
  frameRate: number
  resolution: { width: number; height: number }
  defaultDuration: number
}

export interface FileContent {
  path: string
  content: string
  language: 'svml' | 'svs' | 'svrun' | 'markdown' | 'yaml' | 'json' | 'plaintext'
  isDirty: boolean
  lastModified: string
}

export interface Script {
  id: string
  name: string
  content: string
  language: 'svml'
  clock: string
  createdAt: string
  updatedAt: string
}

export interface Timeline {
  id: string
  name: string
  clock: string
  frameRate: number
  tracks: Track[]
  createdAt: string
  updatedAt: string
}

export interface Track {
  id: string
  name: string
  type: 'visual' | 'audio' | 'typo'
  clips: Clip[]
  isVisible: boolean
  isLocked: boolean
  order: number
}

export interface Clip {
  id: string
  trackId: string
  name: string
  startTime: number
  endTime: number
  componentId?: string
  properties: Record<string, unknown>
  isEnabled: boolean
}

export interface Component {
  id: string
  name: string
  type: 'visual' | 'audio' | 'effect' | 'transition' | 'generator'
  category: string
  code: string
  properties: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface PromptKit {
  id: string
  name: string
  description: string
  version: string
  surfaces: Surface[]
  recipes: Recipe[]
  createdAt: string
  updatedAt: string
}

export interface Surface {
  id: string
  name: string
  type: 'image' | 'video' | 'audio' | 'text'
  parameters: Record<string, unknown>
}

export interface Recipe {
  id: string
  name: string
  description: string
  steps: RecipeStep[]
}

export interface RecipeStep {
  id: string
  action: string
  parameters: Record<string, unknown>
}

export interface Reference {
  id: string
  name: string
  type: 'video' | 'audio' | 'image' | 'project'
  path: string
  metadata: Record<string, unknown>
  createdAt: string
}

export interface Build {
  id: string
  projectId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  outputPath?: string
  error?: string
  startedAt: string
  completedAt?: string
  candidates: BuildCandidate[]
}

export interface BuildCandidate {
  id: string
  buildId: string
  name: string
  previewUrl?: string
  metadata: Record<string, unknown>
  selected: boolean
}

export interface Settings {
  appearance: AppearanceSettings
  editor: EditorSettings
  timeline: TimelineSettings
  preview: PreviewSettings
  build: BuildSettings
  studio: StudioSettings
  shortcuts: Record<string, string>
}

export interface AppearanceSettings {
  theme: 'dark' | 'light' | 'system'
  accentColor: string
  fontSize: number
  fontFamily: string
  density: 'compact' | 'comfortable' | 'spacious'
}

export interface EditorSettings {
  tabSize: number
  insertSpaces: boolean
  wordWrap: 'on' | 'off' | 'bounded'
  minimap: boolean
  lineNumbers: 'on' | 'off' | 'relative'
  formatOnSave: boolean
  autoSave: boolean
  autoSaveDelay: number
}

export interface TimelineSettings {
  defaultDuration: number
  snapToGrid: boolean
  gridSize: number
  showTimecode: boolean
  showFrames: boolean
  trackHeight: number
  playheadColor: string
}

export interface PreviewSettings {
  autoPlay: boolean
  loop: boolean
  quality: 'low' | 'medium' | 'high'
  showGuides: boolean
  showSafeArea: boolean
}

export interface BuildSettings {
  defaultOutputFormat: 'mp4' | 'webm' | 'gif'
  defaultQuality: 'low' | 'medium' | 'high' | 'lossless'
  ffmpegPath?: string
  parallelJobs: number
  cleanupTempFiles: boolean
}

export interface StudioSettings {
  host: string
  port: number
  autoConnect: boolean
  reconnectAttempts: number
  reconnectDelay: number
}

export interface Studio {
  id: string
  name: string
  host: string
  port: number
  status: 'disconnected' | 'connecting' | 'connected' | 'error'
  version?: string
  capabilities: string[]
  lastConnected?: string
}