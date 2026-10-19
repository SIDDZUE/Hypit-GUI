import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Inspector from './Inspector'
import { useProjectStore } from '../store/projectStore'
import { PanelRight, LayoutDashboard } from 'lucide-react'
import { clsx } from 'clsx'

export default function Layout() {
  const { sidebarOpen, inspectorOpen, previewOpen, toggleSidebar, toggleInspector, togglePreview } = useProjectStore()

  return (
    <div className="flex h-screen w-full bg-hypit-950 text-hypit-50 overflow-hidden">
      <aside
        className={clsx(
          'transition-all duration-200 ease-in-out z-20 bg-hypit-900 border-r border-hypit-800',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        <Sidebar collapsed={!sidebarOpen} />
      </aside>

      <main className={clsx('flex-1 flex flex-col overflow-hidden transition-all duration-200')}>
        <Header
          onToggleSidebar={toggleSidebar}
          onToggleInspector={toggleInspector}
          onTogglePreview={togglePreview}
          inspectorOpen={inspectorOpen}
          previewOpen={previewOpen}
        />

        <div className="flex-1 flex overflow-hidden">
          <Outlet />
        </div>
      </main>

      {inspectorOpen && (
        <aside className="transition-all duration-200 ease-in-out z-10 bg-hypit-900 border-l border-hypit-800 w-80">
          <Inspector />
        </aside>
      )}

      {previewOpen && (
        <aside className="transition-all duration-200 ease-in-out z-10 bg-hypit-900 border-l border-hypit-800 w-96">
          <div className="flex h-full flex-col">
            <div className="panel-header flex items-center justify-between px-4 py-3">
              <h3 className="font-medium text-hypit-100">Preview</h3>
              <button
                onClick={togglePreview}
                className="p-1 rounded-sm hover:bg-hypit-800 transition-colors"
                aria-label="Close preview"
              >
                <PanelRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 bg-hypit-950 relative">
              <div className="absolute inset-0 flex items-center justify-center text-hypit-500">
                <div className="text-center">
                  <LayoutDashboard className="mx-auto mb-2 w-12 h-12 opacity-50" />
                  <p>Preview panel — connect to Studio for live preview</p>
                  <button
                    disabled
                    title="Studio integration is not available yet"
                    className="mt-2 btn-primary text-sm"
                  >
                    Open in Studio
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  )
}
