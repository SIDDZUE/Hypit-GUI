import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { Plus, FolderOpen, Trash2, Clock, FileText, ExternalLink } from 'lucide-react'
import { clsx } from 'clsx'
import type { Project } from '../types'

export default function ProjectDashboard() {
  const { currentProject, recentProjects, setCurrentProject } = useProjectStore()
  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectPath, setNewProjectPath] = useState('')

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: newProjectName,
      path: newProjectPath || `/projects/${newProjectName.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        frameRate: 30,
        resolution: { width: 1920, height: 1080 },
        defaultDuration: 30,
      },
    }
    setCurrentProject(newProject)
    setShowNewProject(false)
    setNewProjectName('')
    setNewProjectPath('')
  }

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project)
  }

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this project from recent list?')) {
      useProjectStore.getState().setRecentProjects(
        useProjectStore.getState().recentProjects.filter(p => p.id !== projectId)
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex h-full flex-col p-6 overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-hypit-100 mb-2">Projects</h1>
        <p className="text-hypit-400">Manage your Hypit video production projects</p>
      </div>

      {/* Current Project */}
      {currentProject && (
        <div className="mb-8 panel rounded-xl border border-hypit-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <FileText className="w-7 h-7 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-hypit-100">{currentProject.name}</h2>
                <p className="text-hypit-400 text-sm">{currentProject.path}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn-secondary flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                Open
              </button>
              <button className="btn-primary flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Open in Studio
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-hypit-800/50 rounded-lg p-3">
              <p className="text-hypit-500">Last Modified</p>
              <p className="font-medium text-hypit-100">{formatDate(currentProject.updatedAt)}</p>
            </div>
            <div className="bg-hypit-800/50 rounded-lg p-3">
              <p className="text-hypit-500">Frame Rate</p>
              <p className="font-medium text-hypit-100">{currentProject.settings?.frameRate || 30} fps</p>
            </div>
            <div className="bg-hypit-800/50 rounded-lg p-3">
              <p className="text-hypit-500">Resolution</p>
              <p className="font-medium text-hypit-100">
                {currentProject.settings?.resolution?.width || 1920}×{currentProject.settings?.resolution?.height || 1080}
              </p>
            </div>
            <div className="bg-hypit-800/50 rounded-lg p-3">
              <p className="text-hypit-500">Default Duration</p>
              <p className="font-medium text-hypit-100">{currentProject.settings?.defaultDuration || 30}s</p>
            </div>
          </div>
        </div>
      )}

      {/* New Project Form */}
      {showNewProject && (
        <div className="mb-6 panel rounded-xl border border-hypit-700 p-6 bg-hypit-900/50">
          <h3 className="text-lg font-medium text-hypit-100 mb-4">Create New Project</h3>
          <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
            <div>
              <label className="block text-sm text-hypit-400 mb-1">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Video Project"
                className="input"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-hypit-400 mb-1">Project Path (optional)</label>
              <input
                type="text"
                value={newProjectPath}
                onChange={(e) => setNewProjectPath(e.target.value)}
                placeholder="/projects/my-video-project"
                className="input font-mono text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowNewProject(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleCreateProject} className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-hypit-100">Recent Projects</h2>
        <button
          onClick={() => setShowNewProject(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {recentProjects.length === 0 && !currentProject && (
        <div className="panel rounded-xl border-2 border-dashed border-hypit-800 p-12 text-center">
          <FolderOpen className="mx-auto mb-4 w-12 h-12 text-hypit-500" />
          <h3 className="text-lg font-medium text-hypit-300 mb-2">No projects yet</h3>
          <p className="text-hypit-500 mb-6">Create your first Hypit project to get started</p>
          <button onClick={() => setShowNewProject(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </button>
        </div>
      )}

      {recentProjects.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentProjects
            .filter(p => !currentProject || p.id !== currentProject.id)
            .map((project) => (
              <div
                key={project.id}
                onClick={() => handleOpenProject(project)}
                className={clsx(
                  'panel rounded-xl p-5 cursor-pointer transition-all',
                  'border-hypit-700 hover:border-primary-500/50 hover:bg-hypit-800/50',
                  currentProject?.id === project.id && 'border-primary-500 bg-primary-500/10'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-hypit-800 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-hypit-400" />
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="p-1 rounded hover:bg-hypit-800 text-hypit-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove from recent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-medium text-hypit-100 truncate mb-1">{project.name}</h3>
                <p className="text-xs text-hypit-500 truncate mb-2 font-mono">{project.path}</p>
                <div className="flex items-center gap-3 text-xs text-hypit-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}