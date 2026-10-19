import type { Script, Timeline, Track, Clip, Component as ComponentType } from '../types'

/**
 * Extract attributes from a single XML tag, independent of their order.
 */
function extractAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {}
  const attributeRegex = /([a-zA-Z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
  let match: RegExpExecArray | null
  while ((match = attributeRegex.exec(tag)) !== null) {
    attributes[match[1]] = match[2] ?? match[3] ?? ''
  }
  return attributes
}

/**
 * Parse SVML (Script Visual Markup Language) content
 * Extracts scripts, tracks, clips, and components from SVML XML
 */
export function parseSVML(content: string): Partial<Script> & { tracks?: Track[]; components?: ComponentType[] } {
  const result: Partial<Script> & { tracks?: Track[]; components?: ComponentType[] } = {
    tracks: [],
    components: [],
  }

  // Extract clock
  const clockMatch = content.match(/<time:Clock\b[^>]*>/)
  if (clockMatch) {
    const attrs = extractAttributes(clockMatch[0])
    if (attrs.id) result.clock = attrs.id
  }

  // Extract timeline (its clock reference wins over the clock id)
  const timelineMatch = content.match(/<time:Timeline\b[^>]*>/)
  if (timelineMatch) {
    const attrs = extractAttributes(timelineMatch[0])
    if (attrs.clock) result.clock = attrs.clock
  }

  // Extract track definitions (visual, audio, typo)
  const trackRegex = /<(visual|audio|typo):(Track|Flow)\b[^>]*\/?>/g
  let match: RegExpExecArray | null
  while ((match = trackRegex.exec(content)) !== null) {
    const attrs = extractAttributes(match[0])
    if (!attrs.id) continue
    const type: Track['type'] = match[1] === 'visual' ? 'visual' : match[1] === 'audio' ? 'audio' : 'typo'
    result.tracks?.push({
      id: attrs.id,
      name: attrs.name || attrs.id,
      type,
      clips: [],
      isVisible: true,
      isLocked: false,
      order: result.tracks?.length || 0,
    })
  }

  // Extract clips from script content
  const scriptContentMatch = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/)
  if (scriptContentMatch) {
    const scriptContent = scriptContentMatch[1]
    const clips = parseClipsFromScript(scriptContent)
    result.tracks = result.tracks?.map(track => ({
      ...track,
      clips: clips.filter(c => c.trackId === track.id),
    }))
  }

  return result
}

/**
 * Parse clips from script content
 */
function parseClipsFromScript(scriptContent: string): Clip[] {
  const clips: Clip[] = []

  // Match clip-like elements: <clip:...>, <media:...>, <component:...>
  const clipRegex = /<(clip|media|component):([a-zA-Z][\w-]*)\b[^>]*\/?>/g

  let match: RegExpExecArray | null
  while ((match = clipRegex.exec(scriptContent)) !== null) {
    const attrs = extractAttributes(match[0])
    if (!attrs.id || !attrs.track) continue
    clips.push({
      id: attrs.id,
      trackId: attrs.track,
      name: match[2],
      startTime: parseTime(attrs.start ?? '0'),
      endTime: parseTime(attrs.end ?? '0'),
      componentId: match[1] === 'component' ? match[2] : undefined,
      properties: {},
      isEnabled: true,
    })
  }

  return clips
}

/**
 * Parse time string (e.g., "5s", "500ms", "1:30.15") to seconds
 */
export function parseTime(timeStr: string): number {
  const trimmed = timeStr.trim()
  const lower = trimmed.toLowerCase()

  // Handle MM:SS.FF format
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':')
    const minutes = parseInt(parts[0], 10) || 0
    const secondsParts = parts[1].split('.')
    const seconds = parseInt(secondsParts[0], 10) || 0
    const frames = secondsParts[1] ? parseInt(secondsParts[1], 10) / 30 : 0
    return minutes * 60 + seconds + frames
  }

  // Milliseconds must be checked before the plain seconds suffix ("500ms"
  // also ends in "s")
  if (lower.endsWith('ms')) {
    return parseFloat(lower.slice(0, -2)) / 1000
  }

  if (lower.endsWith('s')) {
    return parseFloat(lower.slice(0, -1))
  }

  if (lower.endsWith('f')) {
    return parseFloat(lower.slice(0, -1)) / 30
  }

  // Handle percentage
  if (lower.endsWith('%')) {
    // This would need context of total duration
    return parseFloat(lower.slice(0, -1)) / 100
  }

  // Default to seconds
  return parseFloat(lower) || 0
}

/**
 * Format seconds to time string
 */
export function formatTime(seconds: number, format: 'seconds' | 'frames' | 'timecode' = 'timecode', fps = 30): string {
  switch (format) {
    case 'seconds':
      return `${seconds.toFixed(2)}s`
    case 'frames':
      return `${Math.round(seconds * fps)}f`
    case 'timecode':
    default: {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      const frames = Math.floor((seconds % 1) * fps)
      return `${mins}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`
    }
  }
}

/**
 * Parse SVS (Style Sheet) content
 */
export function parseSVS(content: string): Record<string, string | number | boolean> {
  const styles: Record<string, string | number | boolean> = {}

  // Match property definitions: property: value;
  const propertyRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g
  let match
  while ((match = propertyRegex.exec(content)) !== null) {
    const key = match[1].trim()
    let value: string | number | boolean = match[2].trim()

    // Try to parse value
    if (value === 'true') {
      value = true
    } else if (value === 'false') {
      value = false
    } else if (!isNaN(Number(value))) {
      value = Number(value)
    } else if (value.endsWith('px') && !isNaN(Number(value.slice(0, -2)))) {
      value = Number(value.slice(0, -2))
    } else if (value.endsWith('%') && !isNaN(Number(value.slice(0, -1)))) {
      value = Number(value.slice(0, -1))
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    }

    styles[key] = value
  }

  return styles
}

/**
 * Parse SVRUN (Build Run) content
 */
export function parseSVRUN(content: string): { source?: string; output?: string; candidates?: string[] } {
  const result: { source?: string; output?: string; candidates?: string[] } = {}

  const sourceMatch = content.match(/<svrun[^>]*source=["']([^"']+)["']/)
  if (sourceMatch) result.source = sourceMatch[1]

  const outputMatch = content.match(/<svrun[^>]*output=["']([^"']+)["']/)
  if (outputMatch) result.output = outputMatch[1]

  const candidateMatches = content.matchAll(/<fragment[^>]*candidate=["']([^"']+)["'][^>]*>/g)
  result.candidates = Array.from(candidateMatches).map(m => m[1])

  return result
}

/**
 * Generate SVML from timeline and script data
 */
export function generateSVML(script: Script, timeline: Timeline): string {
  const fps = timeline.frameRate || 30
  const tracksXml = timeline.tracks.map(track => {
    const typePrefix = track.type === 'visual' ? 'visual' : track.type === 'audio' ? 'audio' : 'typo'
    const tagName = track.type === 'typo' ? 'typo:Flow' : `${typePrefix}:Track`
    return `  <${tagName} id="${track.id}" name="${track.name}" />`
  }).join('\n')

  const clipsXml = timeline.tracks.flatMap(track =>
    track.clips.map(clip => {
      const componentAttr = clip.componentId ? ` component="${clip.componentId}"` : ''
      return `    <clip:${clip.name} id="${clip.id}" track="${track.id}" start="${formatTime(clip.startTime, 'timecode', fps)}" end="${formatTime(clip.endTime, 'timecode', fps)}"${componentAttr} />`
    })
  ).join('\n')

  // End of the timeline is the longest clip across all tracks (min 30s)
  const clipEnds = timeline.tracks.flatMap(t => t.clips.map(c => c.endTime))
  const endTime = Math.max(30, 0, ...clipEnds)

  return `<?svml version="1.0"?>
<svml>
  <import source="studio" as="studio" />
  <time:Clock id="${script.clock || 'main-clock'}" frame-rate="${fps}" />
  <time:Timeline clock="${script.clock || 'main-clock'}" end="${formatTime(endTime, 'timecode', fps)}" />

${tracksXml}

  <script>
${clipsXml}
  </script>
</svml>`
}

/**
 * Validate SVML content
 */
export function validateSVML(content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for required root elements
  if (!content.includes('<svml>') && !content.includes('<svml ')) {
    errors.push('Missing <svml> root element')
  }

  if (!content.includes('<time:Clock') && !content.includes('<time:Clock ')) {
    errors.push('Missing <time:Clock> element')
  }

  if (!content.includes('<time:Timeline') && !content.includes('<time:Timeline ')) {
    errors.push('Missing <time:Timeline> element')
  }

  // Check for unclosed tags. The open-tag pattern excludes "/" so
  // self-closing tags (<clip:x ... />) are never counted as opens.
  const openTags = content.match(/<([a-zA-Z:]+)[^/>]*>/g) || []
  const closeTags = content.match(/<\/([a-zA-Z:]+)>/g) || []

  const tagCounts: Record<string, number> = {}
  openTags.forEach(tag => {
    const name = tag.match(/<([a-zA-Z:]+)/)?.[1]
    if (name) tagCounts[name] = (tagCounts[name] || 0) + 1
  })
  closeTags.forEach(tag => {
    const name = tag.match(/<\/([a-zA-Z:]+)>/)?.[1]
    if (name) tagCounts[name] = (tagCounts[name] || 0) - 1
  })

  Object.entries(tagCounts).forEach(([tag, count]) => {
    if (count > 0) {
      errors.push(`Unclosed tag: <${tag}> (${count} unclosed)`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}