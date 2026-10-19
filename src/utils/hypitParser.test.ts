import { describe, it, expect } from 'vitest'
import {
  parseTime,
  formatTime,
  parseSVML,
  parseSVS,
  parseSVRUN,
  generateSVML,
  validateSVML,
} from './hypitParser'
import type { Script, Timeline } from '../types'

const SAMPLE_SVML = `<?svml version="1.0"?>
<svml>
  <import source="studio" as="studio" />
  <time:Clock id="main-clock" frame-rate="30" />
  <time:Timeline clock="master-clock" end="30s" />

  <visual:Track name="Video" id="video-track" />
  <audio:Track id="audio-track" name="Audio" />
  <typo:Flow id="captions" name="Captions" />

  <script>
    <clip:video id="clip-1" track="video-track" start="0s" end="10s" />
    <media:audio id="clip-2" track="audio-track" start="500ms" end="30s" />
    <component:lower-third id="clip-3" track="captions" start="5s" end="15s" />
  </script>
</svml>`

describe('parseTime', () => {
  it('parses seconds', () => {
    expect(parseTime('5s')).toBe(5)
    expect(parseTime('1.5s')).toBe(1.5)
  })

  it('parses milliseconds (checked before the plain seconds suffix)', () => {
    expect(parseTime('500ms')).toBe(0.5)
    expect(parseTime('250ms')).toBe(0.25)
    expect(parseTime('0ms')).toBe(0)
  })

  it('parses frames', () => {
    expect(parseTime('45f')).toBe(1.5)
  })

  it('parses MM:SS.FF timecode', () => {
    expect(parseTime('1:30.15')).toBeCloseTo(90.5)
    expect(parseTime('0:10')).toBe(10)
  })

  it('parses bare numbers as seconds and percentages as fractions', () => {
    expect(parseTime('2')).toBe(2)
    expect(parseTime('50%')).toBe(0.5)
  })

  it('handles invalid input gracefully', () => {
    expect(parseTime('nope')).toBe(0)
  })
})

describe('formatTime', () => {
  it('formats seconds and frames', () => {
    expect(formatTime(1.5, 'seconds')).toBe('1.50s')
    expect(formatTime(2, 'frames')).toBe('60f')
    expect(formatTime(2, 'frames', 24)).toBe('48f')
  })

  it('formats timecode with the given frame rate', () => {
    expect(formatTime(90.5, 'timecode')).toBe('1:30.15')
    expect(formatTime(90.5, 'timecode', 24)).toBe('1:30.12')
    expect(formatTime(2, 'timecode')).toBe('0:02.00')
  })
})

describe('parseSVML', () => {
  it('extracts the clock from the timeline element', () => {
    const result = parseSVML(SAMPLE_SVML)
    expect(result.clock).toBe('master-clock')
  })

  it('extracts tracks regardless of attribute order', () => {
    const result = parseSVML(SAMPLE_SVML)
    expect(result.tracks).toHaveLength(3)
    expect(result.tracks?.map(t => t.type)).toEqual(['visual', 'audio', 'typo'])
    // <visual:Track name="Video" id="video-track" /> — name comes first
    expect(result.tracks?.[0]).toMatchObject({ id: 'video-track', name: 'Video' })
  })

  it('falls back to the id when a track has no name', () => {
    const result = parseSVML('<visual:Track id="no-name" />')
    expect(result.tracks?.[0].name).toBe('no-name')
  })

  it('attaches parsed clips to their tracks, including millisecond times', () => {
    const result = parseSVML(SAMPLE_SVML)
    const video = result.tracks?.find(t => t.id === 'video-track')
    const audio = result.tracks?.find(t => t.id === 'audio-track')
    const captions = result.tracks?.find(t => t.id === 'captions')

    expect(video?.clips).toHaveLength(1)
    expect(video?.clips[0]).toMatchObject({ id: 'clip-1', startTime: 0, endTime: 10 })

    expect(audio?.clips[0].startTime).toBe(0.5)

    expect(captions?.clips[0]).toMatchObject({ id: 'clip-3', componentId: 'lower-third' })
  })

  it('parses script blocks that carry attributes', () => {
    const result = parseSVML(
      '<svml><script lang="svml"><clip:video id="c" track="video-track" start="0s" end="1s" /></script></svml>'
    )
    expect(result.tracks).toBeDefined()
    expect(result.tracks).toHaveLength(0)
  })
})

describe('parseSVS', () => {
  it('parses properties with typed values', () => {
    const styles = parseSVS('font-size: 24px;\nopacity: 0.8;\nloop: true;\ncolor: #ffffff;')
    expect(styles).toMatchObject({
      'font-size': 24,
      opacity: 0.8,
      loop: true,
      color: '#ffffff',
    })
  })
})

describe('parseSVRUN', () => {
  it('extracts source, output, and candidates', () => {
    const result = parseSVRUN(
      '<svrun source="project.svml" output="render/" format="mp4">\n  <fragment candidate="main" />\n  <fragment candidate="preview" />\n</svrun>'
    )
    expect(result.source).toBe('project.svml')
    expect(result.output).toBe('render/')
    expect(result.candidates).toEqual(['main', 'preview'])
  })
})

describe('generateSVML', () => {
  const script: Script = {
    id: 'main-script',
    name: 'Main Script',
    content: '',
    language: 'svml',
    clock: 'main-clock',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  const timeline: Timeline = {
    id: 'main-timeline',
    name: 'Main Timeline',
    clock: 'main-clock',
    frameRate: 24,
    tracks: [
      {
        id: 'video-track',
        name: 'Video',
        type: 'visual',
        clips: [],
        isVisible: true,
        isLocked: false,
        order: 0,
      },
      {
        id: 'audio-track',
        name: 'Audio',
        type: 'audio',
        clips: [
          {
            id: 'clip-2',
            trackId: 'audio-track',
            name: 'audio',
            startTime: 0.5,
            endTime: 90.5,
            properties: {},
            isEnabled: true,
          },
        ],
        isVisible: true,
        isLocked: false,
        order: 1,
      },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  it('uses the project frame rate for timecode formatting', () => {
    const svml = generateSVML(script, timeline)
    expect(svml).toContain('frame-rate="24"')
    expect(svml).toContain('<clip:audio id="clip-2" track="audio-track" start="0:00.12" end="1:30.12" />')
  })

  it('computes the timeline end from the longest clip across all tracks', () => {
    const svml = generateSVML(script, timeline)
    // Longest clip (90.5s) lives on the second track; the first track is empty
    expect(svml).toContain('end="1:30.12"')
    expect(svml).not.toContain('end="0:30.00"')
  })
})

describe('validateSVML', () => {
  it('accepts a valid document with self-closing tags', () => {
    const result = validateSVML(SAMPLE_SVML)
    expect(result.errors).toEqual([])
    expect(result.valid).toBe(true)
  })

  it('flags missing required elements', () => {
    const result = validateSVML('<svml>\n</svml>')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing <time:Clock> element')
    expect(result.errors).toContain('Missing <time:Timeline> element')
  })

  it('flags unclosed tags even when self-closing tags exist', () => {
    const unclosed = SAMPLE_SVML.replace('  </script>', '')
    const result = validateSVML(unclosed)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Unclosed tag: <script> (1 unclosed)')
  })
})
