import { useCallback, useEffect } from 'react'
import { useProjectStore } from '../store/projectStore'
import { parseSVML, generateSVML, validateSVML, formatTime, parseTime } from '../utils/hypitParser'
import { createFileContent, downloadFile, exportProject, importProject } from '../utils/fileUtils'
import type { Project, Script, Timeline, Component as ComponentType, FileContent } from '../types'

export function useProject() {
  const store = useProjectStore()

  // Project actions
  const createProject = useCallback((name: string, path?: string) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name,
      path: path || `/projects/${name.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        frameRate: 30,
        resolution: { width: 1920, height: 1080 },
        defaultDuration: 30,
      },
    }
    store.setCurrentProject(newProject)
    store.addRecentProject(newProject)
    return newProject
  }, [store])

  const openProject = useCallback(async (file: File) => {
    const project = await importProject(file)
    if (project) {
      store.setCurrentProject(project)
      store.addRecentProject(project)
    }
    return project
  }, [store])

  const saveProject = useCallback(() => {
    if (store.currentProject) {
      exportProject(store.currentProject)
    }
  }, [store])

  // Script actions
  const parseScript = useCallback((content: string) => {
    return parseSVML(content)
  }, [])

  const validateScript = useCallback((content: string) => {
    return validateSVML(content)
  }, [])

  const generateScript = useCallback((script: Script, timeline: Timeline) => {
    return generateSVML(script, timeline)
  }, [])

  const createScriptFromTimeline = useCallback((timeline: Timeline): Script => {
    const duration = timeline.tracks[0]?.clips.reduce((max, c) => Math.max(max, c.endTime), 30) || 30
    return {
      id: 'main-script',
      name: 'Main Script',
      content: generateSVML(
        { id: 'main-script', name: 'Main Script', content: '', language: 'svml', clock: timeline.clock, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        timeline
      ),
      language: 'svml',
      clock: timeline.clock,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [])

  // File actions
  const openFile = useCallback((path: string, content: string) => {
    const file = createFileContent(path, content)
    store.openFile(file)
    return file
  }, [store])

  const saveFile = useCallback((fileId: string) => {
    store.markFileSaved(fileId)
  }, [store])

  const saveAllFiles = useCallback(() => {
    store.openFiles.forEach((_, fileId) => {
      store.markFileSaved(fileId)
    })
  }, [store])

  const closeFile = useCallback((fileId: string) => {
    store.closeFile(fileId)
  }, [store])

  // Timeline actions
  const addTrack = useCallback((name: string, type: 'visual' | 'audio' | 'typo') => {
    if (!store.timeline) return
    const newTrack = {
      id: `track-${Date.now()}`,
      name,
      type,
      clips: [] as any[],
      isVisible: true,
      isLocked: false,
      order: store.timeline.tracks.length,
    }
    store.setTimeline({
      ...store.timeline,
      tracks: [...store.timeline.tracks, newTrack],
      updatedAt: new Date().toISOString(),
    })
  }, [store])

  const removeTrack = useCallback((trackId: string) => {
    if (!store.timeline) return
    store.setTimeline({
      ...store.timeline,
      tracks: store.timeline.tracks.filter(t => t.id !== trackId).map((t, i) => ({ ...t, order: i })),
      updatedAt: new Date().toISOString(),
    })
  }, [store])

  const addClip = useCallback((trackId: string, clip: Omit<any, 'id'>) => {
    if (!store.timeline) return
    const newClip = { ...clip, id: `clip-${Date.now()}` }
    store.setTimeline({
      ...store.timeline,
      tracks: store.timeline.tracks.map(t =>
        t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
      ),
      updatedAt: new Date().toISOString(),
    })
  }, [store])

  const removeClip = useCallback((trackId: string, clipId: string) => {
    if (!store.timeline) return
    store.setTimeline({
      ...store.timeline,
      tracks: store.timeline.tracks.map(t =>
        t.id === trackId ? { ...t, clips: t.clips.filter(c => c.id !== clipId) } : t
      ),
      updatedAt: new Date().toISOString(),
    })
  }, [store])

  const updateClip = useCallback((trackId: string, clipId: string, updates: Partial<any>) => {
    if (!store.timeline) return
    store.setTimeline({
      ...store.timeline,
      tracks: store.timeline.tracks.map(t =>
        t.id === trackId
          ? { ...t, clips: t.clips.map(c => (c.id === clipId ? { ...c, ...updates } : c)) }
          : t
      ),
      updatedAt: new Date().toISOString(),
    })
  }, [store])

  // Component actions
  const createComponent = useCallback((
    name: string,
    type: ComponentType['type'],
    category: string = 'custom'
  ) => {
    const newComponent: ComponentType = {
      id: `comp-${Date.now()}`,
      name,
      type,
      category,
      code: '',
      properties: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    store.addComponent(newComponent)
    return newComponent
  }, [store])

  // Utility functions
  const formatTimeUtil = useCallback((seconds: number, format?: 'seconds' | 'frames' | 'timecode') => {
    return formatTime(seconds, format)
  }, [])

  const parseTimeUtil = useCallback((timeStr: string) => {
    return parseTime(timeStr)
  }, [])

  // Computed values
  const currentProject = store.currentProject
  const recentProjects = store.recentProjects
  const openFiles = Array.from(store.openFiles.entries()).map(([path, file]) => ({ path, ...file }))
  const activeFile = store.activeFileId ? store.openFiles.get(store.activeFileId) : null
  const script = store.script
  const timeline = store.timeline
  const components = store.components
  const settings = store.settings

  return {
    // State
    currentProject,
    recentProjects,
    openFiles,
    activeFile,
    script,
    timeline,
    components,
    settings,

    // Project actions
    createProject,
    openProject,
    saveProject,
    setCurrentProject: store.setCurrentProject,

    // Script actions
    parseScript,
    validateScript,
    generateScript,
    createScriptFromTimeline,
    setScript: store.setScript,

    // File actions
    openFile,
    saveFile,
    saveAllFiles,
    closeFile,
    setActiveFile: store.setActiveFile,
    updateFileContent: store.updateFileContent,

    // Timeline actions
    addTrack,
    removeTrack,
    addClip,
    removeClip,
    updateClip,
    setTimeline: store.setTimeline,

    // Component actions
    createComponent,
    addComponent: store.addComponent,
    updateComponent: store.updateComponent,
    removeComponent: store.removeComponent,
    setComponents: store.setComponents,

    // Settings
    setSettings: store.setSettings,

    // UI
    sidebarOpen: store.sidebarOpen,
    inspectorOpen: store.inspectorOpen,
    previewOpen: store.previewOpen,
    toggleSidebar: store.toggleSidebar,
    toggleInspector: store.toggleInspector,
    togglePreview: store.togglePreview,

    // Utilities
    formatTime: formatTimeUtil,
    parseTime: parseTimeUtil,

    // Store reset
    reset: store.reset,
  }
}

// Specialized hooks for specific use cases

export function useScript() {
  const { script, setScript, parseScript, validateScript, generateScript, updateFileContent, activeFileId, openFiles } = useProjectStore()
  const activeFile = activeFileId ? openFiles.get(activeFileId) : null

  return {
    script,
    activeFile,
    setScript,
    parseScript,
    validateScript,
    generateScript,
    updateContent: (content: string) => {
      if (activeFileId) {
        updateFileContent(activeFileId, content)
      }
    },
  }
}

export function useTimeline() {
  const { timeline, setTimeline, addTrack, removeTrack, addClip, removeClip, updateClip } = useProject()

  return {
    timeline,
    setTimeline,
    addTrack,
    removeTrack,
    addClip,
    removeClip,
    updateClip,
    duration: timeline?.tracks[0]?.clips.reduce((max, c) => Math.max(max, c.endTime), 30) || 30,
    trackCount: timeline?.tracks.length || 0,
    totalClips: timeline?.tracks.reduce((sum, t) => sum + t.clips.length, 0) || 0,
  }
}

export function useComponents() {
  const { components, addComponent, updateComponent, removeComponent, createComponent } = useProject()

  return {
    components,
    addComponent,
    updateComponent,
    removeComponent,
    createComponent,
    getComponent: (id: string) => components.find(c => c.id === id),
    getComponentsByType: (type: ComponentType['type']) => components.filter(c => c.type === type),
    getComponentsByCategory: (category: string) => components.filter(c => c.category === category),
  }
}

export function useFiles() {
  const { openFiles, activeFile, openFile, saveFile, saveAllFiles, closeFile, setActiveFile, updateFileContent } = useProject()

  return {
    files: openFiles,
    activeFile,
    openFile,
    saveFile,
    saveAllFiles,
    closeFile,
    setActiveFile,
    updateContent: updateFileContent,
    hasUnsavedChanges: openFiles.some(f => f.isDirty),
  }
}

export function useShortcuts() {
  const { settings } = useProjectStore()

  const shortcuts = settings?.shortcuts || {
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
  }

  const handleShortcut = useCallback((event: KeyboardEvent) => {
    // This would be implemented with a proper shortcut handler
    // For now, just return the shortcuts map
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [handleShortcut])

  return { shortcuts }
}