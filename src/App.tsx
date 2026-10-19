import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProjectDashboard from './pages/ProjectDashboard'
import ScriptEditor from './pages/ScriptEditor'
import TimelineEditor from './pages/TimelineEditor'
import ComponentEditor from './pages/ComponentEditor'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProjectDashboard />} />
        <Route path="script" element={<ScriptEditor />} />
        <Route path="timeline" element={<TimelineEditor />} />
        <Route path="components" element={<ComponentEditor />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}

export default App