import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, FileContent, Script, Timeline, Track, Clip, Component as ComponentType, Settings, Build, Reference } from '../types'

interface SelectedElement {
  type: 'clip' | 'component' | 'track' | 'file'
  id: string
}

interface ProjectState {
  currentProject: Project | null
  recentProjects: Project[]
  openFiles: Map<string, FileContent>
  activeFileId: string | null
  script: Script | null
  timeline: Timeline | null
  components: ComponentType[]
  references: Reference[]
  builds: Build[]
  settings: Settings | null
  sidebarOpen: boolean
  inspectorOpen: boolean
  previewOpen: boolean
  selectedElement: SelectedElement | null

  setCurrentProject: (project: Project | null) => void
  addRecentProject: (project: Project) => void
  setRecentProjects: (projects: Project[]) => void
  openFile: (file: FileContent) => void
  closeFile: (fileId: string) => void
  setActiveFile: (fileId: string | null) => void
  updateFileContent: (fileId: string, content: string) => void
  markFileSaved: (fileId: string) => void
  setScript: (script: Script | null) => void
  setTimeline: (timeline: Timeline | null) => void
  updateTrack: (trackId: string, updates: Partial<Track>) => void
  setComponents: (components: ComponentType[]) => void
  addComponent: (component: ComponentType) => void
  updateComponent: (id: string, updates: Partial<ComponentType>) => void
  removeComponent: (id: string) => void
  setReferences: (references: Reference[]) => void
  addReference: (reference: Reference) => void
  removeReference: (id: string) => void
  setBuilds: (builds: Build[]) => void
  addBuild: (build: Build) => void
  updateBuild: (id: string, updates: Partial<Build>) => void
  setSettings: (settings: Settings | null) => void
  setSelectedElement: (element: SelectedElement | null) => void
  toggleSidebar: () => void
  toggleInspector: () => void
  togglePreview: () => void
  reset: () => void
}

const initialState = {
  currentProject: null,
  recentProjects: [],
  openFiles: new Map(),
  activeFileId: null,
  script: null,
  timeline: null,
  components: [],
  references: [],
  builds: [],
  settings: null,
  sidebarOpen: true,
  inspectorOpen: true,
  previewOpen: false,
  selectedElement: null,
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentProject: (project) => set({ currentProject: project }),

      addRecentProject: (project) => set((state) => {
        const filtered = state.recentProjects.filter(p => p.id !== project.id)
        return { recentProjects: [project, ...filtered].slice(0, 10) }
      }),

      openFile: (file) => set((state) => {
        const newFiles = new Map(state.openFiles)
        newFiles.set(file.path, file)
        return { openFiles: newFiles, activeFileId: file.path }
      }),

      closeFile: (fileId) => set((state) => {
        const newFiles = new Map(state.openFiles)
        newFiles.delete(fileId)
        const newActive = state.activeFileId === fileId
          ? (newFiles.size > 0 ? newFiles.keys().next().value : null)
          : state.activeFileId
        return { openFiles: newFiles, activeFileId: newActive }
      }),

      setActiveFile: (fileId) => set({ activeFileId: fileId }),

      updateFileContent: (fileId, content) => set((state) => {
        const newFiles = new Map(state.openFiles)
        const file = newFiles.get(fileId)
        if (file) {
          newFiles.set(fileId, { ...file, content, isDirty: true })
        }
        return { openFiles: newFiles }
      }),

      markFileSaved: (fileId) => set((state) => {
        const newFiles = new Map(state.openFiles)
        const file = newFiles.get(fileId)
        if (file) {
          newFiles.set(fileId, { ...file, isDirty: false })
        }
        return { openFiles: newFiles }
      }),

      setScript: (script) => set({ script }),
      setTimeline: (timeline) => set({ timeline }),

      updateTrack: (trackId, updates) => set((state) => {
        if (!state.timeline) return state
        return {
          timeline: {
            ...state.timeline,
            tracks: state.timeline.tracks.map(t =>
              t.id === trackId ? { ...t, ...updates } : t
            ),
            updatedAt: new Date().toISOString(),
          },
        }
      }),

      setComponents: (components) => set({ components }),

      addComponent: (component) => set((state) => ({
        components: [...state.components, component]
      })),

      updateComponent: (id, updates) => set((state) => ({
        components: state.components.map(c => c.id === id ? { ...c, ...updates } : c)
      })),

      removeComponent: (id) => set((state) => ({
        components: state.components.filter(c => c.id !== id)
      })),

      setReferences: (references) => set({ references }),

      addReference: (reference) => set((state) => ({
        references: [...state.references, reference]
      })),

      removeReference: (id) => set((state) => ({
        references: state.references.filter(r => r.id !== id)
      })),

      setBuilds: (builds) => set({ builds }),

      addBuild: (build) => set((state) => ({
        builds: [build, ...state.builds]
      })),

      updateBuild: (id, updates) => set((state) => ({
        builds: state.builds.map(b => b.id === id ? { ...b, ...updates } : b)
      })),

      setSettings: (settings) => set({ settings }),

      setSelectedElement: (element) => set({ selectedElement: element }),

      setRecentProjects: (projects) => set({ recentProjects: projects }),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
      togglePreview: () => set((state) => ({ previewOpen: !state.previewOpen })),

      reset: () => set(initialState),
    }),
    {
      name: 'hypit-project-store',
      partialize: (state) => ({
        recentProjects: state.recentProjects,
        sidebarOpen: state.sidebarOpen,
        inspectorOpen: state.inspectorOpen,
        previewOpen: state.previewOpen,
        selectedElement: state.selectedElement,
      }),
    }
  )
)