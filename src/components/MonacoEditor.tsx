import { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

interface MonacoEditorProps {
  language?: 'svml' | 'svs' | 'svrun' | 'markdown' | 'yaml' | 'json'
  height?: string
  width?: string
  onChange?: (content: string) => void
  readOnly?: boolean
}

const HYPIT_SVML_LANGUAGE = 'hypit-svml'
const HYPIT_SVS_LANGUAGE = 'hypit-svs'
const HYPIT_SVRUN_LANGUAGE = 'hypit-svrun'

export default function MonacoEditor({
  language = 'svml',
  height = '100%',
  width = '100%',
  onChange,
  readOnly = false,
}: MonacoEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const registerLanguages = () => {
      if (!monaco.languages.getLanguages().find(l => l.id === HYPIT_SVML_LANGUAGE)) {
        monaco.languages.register({ id: HYPIT_SVML_LANGUAGE })
        monaco.languages.setMonarchTokensProvider(HYPIT_SVML_LANGUAGE, {
          tokenizer: {
            root: [
              [/<\?svml[\s\S]*?\?>/, 'meta.tag'],
              [/<\/?(?:svml|import|script|time:Timeline|time:Window|time:Instant|time:Clock|visual:Track|audio:Track|typo:Flow|copy:Value|copy:Render|gpt:Image|pipeline:Normalize)\b/, 'tag'],
              [/@\{[^}]+\}/, 'keyword'],
              [/\{\{[^}]+\}\}/, 'variable'],
              [/"[^"]*"/, 'string'],
              [/'[^']*'/, 'string'],
              [/\b(from|as|source|version|id|clock|end|for|from|until|at|frame-rate)\b/, 'attribute.name'],
              [/=/, 'delimiter'],
              [/\b(true|false|null)\b/, 'constant'],
              [/\d+/, 'number'],
              [/<!--[\s\S]*?-->/, 'comment'],
            ],
          },
        })

        monaco.languages.setLanguageConfiguration(HYPIT_SVML_LANGUAGE, {
          brackets: [
            ['<', '>'],
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
          ],
          autoClosingPairs: [
            { open: '<', close: '>' },
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: '@{', close: '}' },
          ],
          surroundingPairs: [
            { open: '<', close: '>' },
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
          comments: {
            start: '<!--',
            end: '-->',
          },
        })
      }

      if (!monaco.languages.getLanguages().find(l => l.id === HYPIT_SVS_LANGUAGE)) {
        monaco.languages.register({ id: HYPIT_SVS_LANGUAGE })
        monaco.languages.setMonarchTokensProvider(HYPIT_SVS_LANGUAGE, {
          tokenizer: {
            root: [
              [/<\?svml[\s\S]*?\?>/, 'meta.tag'],
              [/\b(?:sheet|version|id)\b/, 'keyword'],
              [/\b(?:media|caption|typo|visual|audio)\./, 'namespace'],
              [/[a-zA-Z_][a-zA-Z0-9_-]*(?=\s*:)/, 'property'],
              [/:(?=\s)/, 'delimiter'],
              [/;/, 'delimiter'],
              [/"[^"]*"/, 'string'],
              [/'[^']*'/, 'string'],
              [/\b(true|false|null)\b/, 'constant'],
              [/\d+(?:f|ms|%)?/, 'number'],
              [/\{[^}]+\}/, 'variable'],
              [/\#[^\n]*/, 'comment'],
            ],
          },
        })

        monaco.languages.setLanguageConfiguration(HYPIT_SVS_LANGUAGE, {
          brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
          ],
          autoClosingPairs: [
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
        })
      }

      if (!monaco.languages.getLanguages().find(l => l.id === HYPIT_SVRUN_LANGUAGE)) {
        monaco.languages.register({ id: HYPIT_SVRUN_LANGUAGE })
        monaco.languages.setMonarchTokensProvider(HYPIT_SVRUN_LANGUAGE, {
          tokenizer: {
            root: [
              [/<\?svml[\s\S]*?\?>/, 'meta.tag'],
              [/<\/?(?:svrun|author|target|build-record|satisfy|fragment)\b/, 'tag'],
              [/@\{[^}]+\}/, 'keyword'],
              [/\{\{[^}]+\}\}/, 'variable'],
              [/"[^"]*"/, 'string'],
              [/'[^']*'/, 'string'],
              [/\b(?:source|output|candidate|version|run)\b/, 'attribute.name'],
              [/=/, 'delimiter'],
              [/\b(true|false|null)\b/, 'constant'],
              [/\d+/, 'number'],
              [/<!--[\s\S]*?-->/, 'comment'],
            ],
          },
        })

        monaco.languages.setLanguageConfiguration(HYPIT_SVRUN_LANGUAGE, {
          brackets: [
            ['<', '>'],
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
          ],
          autoClosingPairs: [
            { open: '<', close: '>' },
            { open: '{', close: '}' },
            { open: '[', close: ']' },
            { open: '(', close: ')' },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
            { open: '@{', close: '}' },
          ],
          comments: {
            start: '<!--',
            end: '-->',
          },
        })
      }

      setIsReady(true)
    }

    registerLanguages()

    monaco.editor.defineTheme('hypit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'tag', foreground: '569CD6' },
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'variable', foreground: '4EC9B0' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'constant', foreground: '4FC1FF' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'meta.tag', foreground: '808080' },
        { token: 'namespace', foreground: '4EC9B0' },
        { token: 'property', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#020617',
        'editor.foreground': '#F8FAFC',
        'editor.lineHighlightBackground': '#0F172A',
        'editor.selectionBackground': '#1E3A8A80',
        'editorCursor.foreground': '#F8FAFC',
        'editorLineNumber.foreground': '#64748B',
        'editorLineNumber.activeForeground': '#F8FAFC',
      },
    })
  }, [])

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const handleEditorWillMount = (monacoInstance: typeof monaco) => {
    monacoInstance.editor.defineTheme('hypit-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#020617',
        'editor.foreground': '#F8FAFC',
      },
    })
  }

  const getLanguageId = () => {
    switch (language) {
      case 'svml':
        return HYPIT_SVML_LANGUAGE
      case 'svs':
        return HYPIT_SVS_LANGUAGE
      case 'svrun':
        return HYPIT_SVRUN_LANGUAGE
      default:
        return language
    }
  }

  const handleChange = (value: string | undefined) => {
    if (value !== undefined && onChange) {
      onChange(value)
    }
  }

  return (
    <div className={'flex-1 min-h-0'}>
      {isReady ? (
        <Editor
          height="100%"
          width="100%"
          language={getLanguageId()}
          theme="hypit-dark"
          value={''}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          beforeMount={handleEditorWillMount}
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
            folding: true,
            renderWhitespace: 'selection',
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
            },
          }}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-hypit-950 text-hypit-500">
          Loading editor...
        </div>
      )}
    </div>
  )
}