import type { Script, Timeline, Track, Clip, Component as ComponentType, Project } from '../types'

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
  const clockMatch = content.match(/<time:Clock[^>]*id=["']([^"']+)["'][^>]*>/)
  if (clockMatch) {
    result.clock = clockMatch[1]
  }

  // Extract timeline
  const timelineMatch = content.match(/<time:Timeline[^>]*clock=["']([^"']+)["'][^>]*>/)
  if (timelineMatch) {
    result.clock = timelineMatch[1]
  }

  // Extract visual tracks
  const visualTrackRegex = /<visual:Track[^>]*id=["']([^"']+)["'][^>]*name=["']([^"']+)["'][^>]*>/g
  let match
  while ((match = visualTrackRegex.exec(content)) !== null) {
    result.tracks?.push({
      id: match[1],
      name: match[2],
      type: 'visual',
      clips: [],
      isVisible: true,
      isLocked: false,
      order: result.tracks?.length || 0,
    })
  }

  // Extract audio tracks
  const audioTrackRegex = /<audio:Track[^>]*id=["']([^"']+)["'][^>]*name=["']([^"']+)["'][^>]*>/g
  while ((match = audioTrackRegex.exec(content)) !== null) {
    result.tracks?.push({
      id: match[1],
      name: match[2],
      type: 'audio',
      clips: [],
      isVisible: true,
      isLocked: false,
      order: result.tracks?.length || 0,
    })
  }

  // Extract typo tracks
  const typoTrackRegex = /<typo:Flow[^>]*id=["']([^"']+)["'][^>]*name=["']([^"']+)["'][^>]*>/g
  while ((match = typoTrackRegex.exec(content)) !== null) {
    result.tracks?.push({
      id: match[1],
      name: match[2],
      type: 'typo',
      clips: [],
      isVisible: true,
      isLocked: false,
      order: result.tracks?.length || 0,
    })
  }

  // Extract clips from script content
  const scriptContentMatch = content.match(/<script>([\s\S]*?)<\/script>/)
  if (scriptContentMatch) {
    const scriptContent = scriptContentMatch[1]
    const clips = parseClipsFromScript(scriptContent, result.tracks || [])
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
function parseClipsFromScript(scriptContent: string, tracks: Track[]): Clip[] {
  const clips: Clip[] = []

  // Match clip-like elements: <clip:...>, <media:...>, <component:...>
  const clipRegex = /<(clip|media|component):([a-zA-Z-]+)[^>]*id=["']([^"']+)["'][^>]*track=["']([^"']+)["'][^>]*start=["']([^"']+)["'][^>]*end=["']([^"']+)["'][^>]*>/g

  let match
  while ((match = clipRegex.exec(scriptContent)) !== null) {
    clips.push({
      id: match[3],
      trackId: match[4],
      name: match[2],
      startTime: parseTime(match[5]),
      endTime: parseTime(match[6]),
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
  // Handle MM:SS.FF format
  if (timeStr.includes(':')) {
    const parts = timeStr.split(':')
    const minutes = parseInt(parts[0], 10)
    const secondsParts = parts[1].split('.')
    const seconds = parseInt(secondsParts[0], 10)
    const frames = secondsParts[1] ? parseInt(secondsParts[1], 10) / 30 : 0
    return minutes * 60 + seconds + frames
  }

  // Handle seconds with 's' suffix
  if (timeStr.endsWith('s')) {
    return parseFloat(timeStr.slice(0, -1))
  }

  // Handle milliseconds with 'ms' suffix
  if (timeStr.endsWith('ms')) {
    return parseFloat(timeStr.slice(0, -2)) / 1000
  }

  // Handle frames with 'f' suffix
  if (timeStr.endsWith('f')) {
    return parseFloat(timeStr.slice(0, -1)) / 30
  }

  // Handle percentage
  if (timeStr.endsWith('%')) {
    // This would need context of total duration
    return parseFloat(timeStr.slice(0, -1)) / 100
  }

  // Default to seconds
  return parseFloat(timeStr) || 0
}

/**
 * Format seconds to time string
 */
export function formatTime(seconds: number, format: 'seconds' | 'frames' | 'timecode' = 'timecode'): string {
  switch (format) {
    case 'seconds':
      return `${seconds.toFixed(2)}s`
    case 'frames':
      return `${Math.round(seconds * 30)}f`
    case 'timecode':
    default: {
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      const frames = Math.floor((seconds % 1) * 30)
      return `${mins}:${secs.toString().padStart(2, '0')}.${frames.toString().padStart(2, '0')}`
    }
  }
}

/**
 * Parse SVS (Style Sheet) content
 */
export function parseSVS(content: string): Record<string, any> {
  const styles: Record<string, any> = {}

  // Match property definitions: property: value;
  const propertyRegex = /([a-zA-Z-]+)\s*:\s*([^;]+);/g
  let match
  while ((match = propertyRegex.exec(content)) !== null) {
    const key = match[1].trim()
    let value = match[2].trim()

    // Try to parse value
    if (value === 'true' || value === 'false') {
      value = value === 'true'
    } else if (!isNaN(Number(value))) {
      value = Number(value)
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
  const tracksXml = timeline.tracks.map(track => {
    const typePrefix = track.type === 'visual' ? 'visual' : track.type === 'audio' ? 'audio' : 'typo'
    const tagName = track.type === 'typo' ? 'typo:Flow' : `${typePrefix}:Track`
    return `  <${tagName} id="${track.id}" name="${track.name}" />`
  }).join('\n')

  const clipsXml = timeline.tracks.flatMap(track =>
    track.clips.map(clip => {
      const componentAttr = clip.componentId ? ` component="${clip.componentId}"` : ''
      return `    <clip:${clip.name} id="${clip.id}" track="${track.id}" start="${formatTime(clip.startTime)}" end="${formatTime(clip.endTime)}"${componentAttr} />`
    })
  ).join('\n')

  return `<?svml version="1.0"?>
<svml>
  <import source="studio" as="studio" />
  <time:Clock id="${script.clock || 'main-clock'}" frame-rate="${timeline.frameRate}" />
  <time:Timeline clock="${script.clock || 'main-clock'}" end="${formatTime(timeline.tracks[0]?.clips.reduce((max, c) => Math.max(max, c.endTime), 30) || 30)}" />

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

  // Check for unclosed tags
  const openTags = content.match(/<([a-zA-Z:]+)[^/>]*>/g) || []
  const closeTags = content.match(/<\/([a-zA-Z:]+)>/g) || []
  const selfClosing = content.match(/<([a-zA-Z:]+)[^>]*\/>/g) || []

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