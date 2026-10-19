import { NavLink } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { FileText, LayoutDashboard, Box, Settings, FolderOpen, Plus } from 'lucide-react'
import { clsx } from 'clsx'

interface SidebarProps {
  collapsed: boolean
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const { currentProject, recentProjects, setCurrentProject } = useProjectStore()

  const navItems = [
    { path: '/', label: 'Project', icon: FolderOpen },
    { path: '/script', label: 'Script', icon: FileText },
    { path: '/timeline', label: 'Timeline', icon: LayoutDashboard },
    { path: '/components', label: 'Components', icon: Box },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-4 border-b border-hypit-800">
        {!collapsed && (
          <h1 className="text-xl font-bold text-hypit-50 flex items-center gap-2">
            <span className="text-primary-500">H</span>ypit
          </h1>
        )}
        <div className="flex items-center gap-1">
          <span className={clsx('w-2 h-2 rounded-full', currentProject ? 'bg-green-500' : 'bg-hypit-600')} />
          {!collapsed && currentProject && (
            <span className="text-xs text-hypit-400 truncate max-w-[120px]">
              {currentProject.name}
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600/20 text-primary-400'
                  : 'text-hypit-400 hover:bg-hypit-800 hover:text-hypit-100',
                collapsed && 'justify-center'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {!collapsed && currentProject && (
        <div className="border-t border-hypit-800 p-4">
          <h3 className="text-xs font-medium text-hypit-500 uppercase tracking-wider mb-3">
            Recent Projects
          </h3>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {recentProjects.slice(0, 5).map((project) => (
              <button
                key={project.id}
                onClick={() => setCurrentProject(project)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  'text-hypit-400 hover:bg-hypit-800 hover:text-hypit-100',
                  currentProject.id === project.id && 'bg-primary-600/20 text-primary-400'
                )}
              >
                <div className="truncate font-medium">{project.name}</div>
                <div className="text-xs text-hypit-500 truncate">{project.path}</div>
              </button>
            ))}
            {recentProjects.length === 0 && (
              <p className="text-xs text-hypit-500 text-center py-2">No recent projects</p>
            )}
          </div>
        </div>
      )}

      <div className="border-t border-hypit-800 p-4">
        {!collapsed ? (
          <button className="btn-secondary w-full justify-start gap-2">
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        ) : (
          <button
            className="btn-secondary w-full justify-center"
            title="New Project"
            aria-label="New Project"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}