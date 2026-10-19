import type { FileContent, Project } from '../types'

/**
 * Read a file from the filesystem (using File System Access API)
 */
export async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

/**
 * Write content to a file (using File System Access API)
 */
export async function writeFile(fileHandle: FileSystemFileHandle, content: string): Promise<void> {
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

/**
 * Create a new file in a directory
 */
export async function createFile(dirHandle: FileSystemDirectoryHandle, name: string, content: string): Promise<FileSystemFileHandle> {
  const fileHandle = await dirHandle.getFileHandle(name, { create: true })
  await writeFile(fileHandle, content)
  return fileHandle
}

/**
 * Get file extension from path
 */
export function getFileExtension(path: string): string {
  const parts = path.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : ''
}

/**
 * Get file name from path
 */
export function getFileName(path: string): string {
  return path.split('/').pop() || path
}

/**
 * Get directory path from file path
 */
export function getDirPath(path: string): string {
  const parts = path.split('/')
  parts.pop()
  return parts.join('/')
}

/**
 * Detect language from file extension
 */
export function detectLanguage(path: string): 'svml' | 'svs' | 'svrun' | 'markdown' | 'yaml' | 'json' | 'plaintext' {
  const ext = getFileExtension(path)
  switch (ext) {
    case 'svml':
      return 'svml'
    case 'svs':
      return 'svs'
    case 'svrun':
      return 'svrun'
    case 'md':
    case 'markdown':
      return 'markdown'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'json':
      return 'json'
    default:
      return 'plaintext'
  }
}

/**
 * Create a FileContent object from a file
 */
export function createFileContent(path: string, content: string): FileContent {
  return {
    path,
    content,
    language: detectLanguage(path),
    isDirty: false,
    lastModified: new Date().toISOString(),
  }
}

/**
 * Download a file in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export project as JSON
 */
export function exportProject(project: Project): void {
  const exportData = {
    ...project,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }
  downloadFile(JSON.stringify(exportData, null, 2), `${project.name}.hypit.json`, 'application/json')
}

/**
 * Import project from JSON file
 */
export async function importProject(file: File): Promise<Project | null> {
  try {
    const content = await readFile(file)
    const data = JSON.parse(content)

    // Validate required fields
    if (!data.id || !data.name || !data.path) {
      throw new Error('Invalid project file: missing required fields')
    }

    return data as Project
  } catch (error) {
    console.error('Failed to import project:', error)
    return null
  }
}

/**
 * Generate a unique ID
 */
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get MIME type from extension
 */
export function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    svml: 'text/xml',
    svs: 'text/plain',
    svrun: 'text/xml',
    md: 'text/markdown',
    txt: 'text/plain',
    json: 'application/json',
    yaml: 'application/yaml',
    yml: 'application/yaml',
    js: 'application/javascript',
    ts: 'application/typescript',
    jsx: 'application/javascript',
    tsx: 'application/typescript',
    html: 'text/html',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
  }
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'
}