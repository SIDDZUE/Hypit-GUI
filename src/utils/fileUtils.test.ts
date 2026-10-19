import { describe, it, expect } from 'vitest'
import { getFileExtension, getFileName, detectLanguage, formatFileSize, getMimeType } from './fileUtils'

describe('fileUtils', () => {
  it('extracts file extensions correctly', () => {
    expect(getFileExtension('project/demo.svml')).toBe('svml')
    expect(getFileExtension('archive.tar.gz')).toBe('gz')
    expect(getFileExtension('noextension')).toBe('')
  })

  it('extracts file name from path', () => {
    expect(getFileName('src/pages/ProjectDashboard.tsx')).toBe('ProjectDashboard.tsx')
    expect(getFileName('README.md')).toBe('README.md')
  })

  it('detects language from file extension', () => {
    expect(detectLanguage('script.svml')).toBe('svml')
    expect(detectLanguage('style.svs')).toBe('svs')
    expect(detectLanguage('runner.svrun')).toBe('svrun')
    expect(detectLanguage('doc.md')).toBe('markdown')
    expect(detectLanguage('config.yaml')).toBe('yaml')
    expect(detectLanguage('data.json')).toBe('json')
    expect(detectLanguage('notes.txt')).toBe('plaintext')
  })

  it('formats file sizes cleanly', () => {
    expect(formatFileSize(0)).toBe('0 B')
    expect(formatFileSize(1024)).toBe('1 KB')
    expect(formatFileSize(1048576)).toBe('1 MB')
  })

  it('returns appropriate mime types', () => {
    expect(getMimeType('svml')).toBe('text/xml')
    expect(getMimeType('json')).toBe('application/json')
    expect(getMimeType('png')).toBe('image/png')
    expect(getMimeType('unknownext')).toBe('application/octet-stream')
  })
})
