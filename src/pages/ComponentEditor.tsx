import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import MonacoEditor from '../components/MonacoEditor'
import { Plus, Trash2, Box, Copy, Edit, Code, Layers, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import type { Component as ComponentType } from '../types'

export default function ComponentEditor() {
  const { components, setComponents, addComponent, updateComponent, removeComponent, setSelectedElement } = useProjectStore()
  const [showComponentList, setShowComponentList] = useState(true)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewComponent, setShowNewComponent] = useState(false)
  const [newComponentName, setNewComponentName] = useState('')
  const [newComponentType, setNewComponentType] = useState<'visual' | 'audio' | 'typo' | 'effect'>('visual')
  const [newComponentCategory, setNewComponentCategory] = useState('custom')
  const [editorContent, setEditorContent] = useState('')
  const [activeTab, setActiveTab] = useState<'code' | 'properties'>('code')

  const selectedComponent = selectedComponentId
    ? components.find(c => c.id === selectedComponentId)
    : null

  const handleSelectComponent = (component: ComponentType) => {
    setSelectedComponentId(component.id)
    setSelectedElement({ type: 'component', id: component.id })
    setEditorContent(component.code || '')
  }

  const handleCreateComponent = () => {
    if (!newComponentName.trim()) return
    const newComp: ComponentType = {
      id: `comp-${Date.now()}`,
      name: newComponentName,
      type: newComponentType,
      category: newComponentCategory,
      code: '',
      properties: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addComponent(newComp)
    handleSelectComponent(newComp)
    setShowNewComponent(false)
    setNewComponentName('')
  }

  const handleDeleteComponent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Delete this component?')) {
      removeComponent(id)
      if (selectedComponentId === id) {
        setSelectedComponentId(null)
        setSelectedElement(null)
        setEditorContent('')
      }
    }
  }

  const handleDuplicateComponent = (component: ComponentType) => {
    const newComp: ComponentType = {
      ...component,
      id: `comp-${Date.now()}`,
      name: `${component.name} Copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addComponent(newComp)
    handleSelectComponent(newComp)
  }

  const handleCodeChange = (content: string) => {
    setEditorContent(content)
    if (selectedComponentId) {
      updateComponent(selectedComponentId, { code: content, updatedAt: new Date().toISOString() })
    }
  }

  const handlePropertyChange = (key: string, value: any) => {
    if (selectedComponentId) {
      updateComponent(selectedComponentId, {
        properties: { ...selectedComponent?.properties, [key]: value },
        updatedAt: new Date().toISOString(),
      })
    }
  }

  const filteredComponents = components.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeIcon = (type: ComponentType['type']) => {
    switch (type) {
      case 'visual': return <Box className="w-4 h-4 text-primary-400" />
      case 'audio': return <Layers className="w-4 h-4 text-accent-400" />
      case 'typo': return <FileText className="w-4 h-4 text-green-400" />
      case 'effect': return <Code className="w-4 h-4 text-purple-400" />
    }
  }

  const getTypeColor = (type: ComponentType['type']) => {
    switch (type) {
      case 'visual': return 'bg-primary-500/20 text-primary-400 border-primary-500/30'
      case 'audio': return 'bg-accent-500/20 text-accent-400 border-accent-500/30'
      case 'typo': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'effect': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  }

  return (
    <div className="flex h-full flex-col bg-hypit-950">
      {/* Toolbar */}
      <div className="flex h-10 items-center gap-2 px-3 border-b border-hypit-800 bg-hypit-900">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowComponentList(!showComponentList)}
            className={clsx('btn-ghost p-1.5', showComponentList && 'bg-primary-600/20 text-primary-400')}
            title="Toggle Component List"
          >
            <Box className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-6 bg-hypit-700 mx-1" />

        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hypit-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components..."
              className="input w-full pl-10 pr-4 py-1.5 text-sm bg-hypit-800"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setShowNewComponent(true)} className="btn-primary px-3 py-1.5 text-sm gap-1">
            <Plus className="w-4 h-4" />
            New Component
          </button>
        </div>
      </div>

      {/* New Component Modal */}
      {showNewComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="panel rounded-xl p-6 w-full max-w-md mx-4 bg-hypit-900 border-hypit-700">
            <h3 className="text-lg font-medium text-hypit-100 mb-4">Create New Component</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-hypit-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newComponentName}
                  onChange={(e) => setNewComponentName(e.target.value)}
                  placeholder="My Component"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-hypit-400 mb-1">Type</label>
                <select
                  value={newComponentType}
                  onChange={(e) => setNewComponentType(e.target.value as ComponentType['type'])}
                  className="input bg-hypit-800"
                >
                  <option value="visual">Visual</option>
                  <option value="audio">Audio</option>
                  <option value="typo">Typography</option>
                  <option value="effect">Effect</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-hypit-400 mb-1">Category</label>
                <select
                  value={newComponentCategory}
                  onChange={(e) => setNewComponentCategory(e.target.value)}
                  className="input bg-hypit-800"
                >
                  <option value="custom">Custom</option>
                  <option value="layout">Layout</option>
                  <option value="animation">Animation</option>
                  <option value="transition">Transition</option>
                  <option value="effect">Effect</option>
                  <option value="generator">Generator</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowNewComponent(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleCreateComponent} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Component List Sidebar */}
        {showComponentList && (
          <aside className="w-64 border-r border-hypit-800 bg-hypit-900 flex flex-col">
            <div className="p-3 border-b border-hypit-800 flex items-center justify-between">
              <h3 className="font-medium text-hypit-100">Components</h3>
              <button
                onClick={() => setShowComponentList(false)}
                className="p-1 rounded hover:bg-hypit-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredComponents.map((component) => (
                <button
                  key={component.id}
                  onClick={() => handleSelectComponent(component)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg transition-all flex items-start gap-3',
                    selectedComponentId === component.id
                      ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                      : 'text-hypit-400 hover:bg-hypit-800 hover:text-hypit-100'
                  )}
                >
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', getTypeColor(component.type))}>
                    {getTypeIcon(component.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{component.name}</p>
                    <p className="text-xs text-hypit-500 capitalize">{component.category}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => handleDuplicateComponent(component)}
                      className="p-1 rounded hover:bg-hypit-800 text-hypit-500"
                      title="Duplicate"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteComponent(component.id, e)}
                      className="p-1 rounded hover:bg-hypit-800 text-hypit-500 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              ))}
              {filteredComponents.length === 0 && (
                <p className="text-hypit-500 text-sm text-center py-4">No components</p>
              )}
            </div>
          </aside>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedComponent && (
            <>
              {/* Component Header */}
              <div className="flex h-12 items-center gap-3 px-4 border-b border-hypit-800 bg-hypit-900">
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', getTypeColor(selectedComponent.type))}>
                  {getTypeIcon(selectedComponent.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={selectedComponent.name}
                    onChange={(e) => updateComponent(selectedComponent.id, { name: e.target.value, updatedAt: new Date().toISOString() })}
                    className="bg-transparent border-none text-lg font-medium text-hypit-100 focus:outline-none"
                  />
                  <p className="text-xs text-hypit-500 capitalize">{selectedComponent.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDuplicateComponent(selectedComponent)}
                    className="btn-ghost p-1.5"
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteComponent(selectedComponent.id, e)}
                    className="btn-ghost p-1.5 text-red-400 hover:text-red-300"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex h-10 items-center px-3 border-b border-hypit-800 bg-hypit-900">
                <button
                  onClick={() => setActiveTab('code')}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2',
                    activeTab === 'code'
                      ? 'text-primary-400 border-primary-500 bg-hypit-950'
                      : 'text-hypit-400 hover:text-hypit-100'
                  )}
                >
                  <Code className="w-4 h-4 inline mr-1" />
                  Code
                </button>
                <button
                  onClick={() => setActiveTab('properties')}
                  className={clsx(
                    'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2',
                    activeTab === 'properties'
                      ? 'text-primary-400 border-primary-500 bg-hypit-950'
                      : 'text-hypit-400 hover:text-hypit-100'
                  )}
                >
                  <Layers className="w-4 h-4 inline mr-1" />
                  Properties
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-h-0 relative">
                {activeTab === 'code' && (
                  <MonacoEditor
                    filePath={`${selectedComponent.name}.svml`}
                    language="svml"
                    value={editorContent}
                    onChange={handleCodeChange}
                    height="100%"
                  />
                )}

                {activeTab === 'properties' && (
                  <div className="p-6 overflow-y-auto">
                    <h4 className="font-medium text-hypit-100 mb-4">Component Properties</h4>
                    {Object.keys(selectedComponent.properties).length === 0 ? (
                      <div className="text-center py-12 text-hypit-500">
                        <Code className="mx-auto mb-4 w-12 h-12 opacity-50" />
                        <p>No properties defined</p>
                        <p className="text-sm mt-1">Add properties in the code tab using @{{propertyName}} syntax</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(selectedComponent.properties).map(([key, value]) => (
                          <div key={key} className="flex flex-col gap-1">
                            <label className="text-sm text-hypit-400">{key}</label>
                            <input
                              type="text"
                              value={String(value)}
                              onChange={(e) => handlePropertyChange(key, e.target.value)}
                              className="input"
                            />
                          </div>
                        ))}
                        <button
                          onClick={() => handlePropertyChange(`prop-${Date.now()}`, '')}
                          className="btn-secondary text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Property
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Empty State */}
          {!selectedComponent && (
            <div className="flex-1 flex flex-col items-center justify-center text-hypit-500 p-8">
              <Box className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-hypit-300 mb-2">No component selected</h3>
              <p className="text-sm mb-6">Select a component from the list or create a new one</p>
              <button onClick={() => setShowNewComponent(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Component
              </button>
            </div>
          )}
        </div>

        {/* Toggle component list button when collapsed */}
        {!showComponentList && (
          <button
            onClick={() => setShowComponentList(true)}
            className="w-8 flex items-center justify-center border-r border-hypit-800 bg-hypit-900 hover:bg-hypit-800"
            aria-label="Show component list"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )
}