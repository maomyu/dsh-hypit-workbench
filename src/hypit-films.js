/**
 * Hypit finished films.
 *
 * `hypit build` writes each build to `.hypit/results/<date>/<buildId>/`:
 * `result.json` lists outputs; video outputs are `@hypit/blob` build-files
 * (`files/file-0001.mp4`); `@hypit/temporal TemporalWindow` values give the
 * program's sections (frame spans) and `@hypit/timeline Timeline` the fps.
 * The panel only shows read-only facts from these files.
 */
import { open, readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg'])
const BUILD_ID = /^bld_[\w-]{6,80}$/u
const DATE_DIR = /^\d{4}-\d{2}-\d{2}$/u
const MAX_BUILDS = 30

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')) } catch { return null }
}

function inside(child, parent) {
  const rel = path.relative(parent, child)
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
}

/** Turn "program.quote" into "quote", "takeaway-frame" into "takeaway". */
function prettyName(name) {
  return String(name).replace(/^program\./u, '').replace(/[-_.]/gu, ' ').trim()
}

/** Summarise one build folder. Returns null when it has no playable video. */
export async function readBuild(dir) {
  const result = await readJson(path.join(dir, 'result.json'))
  if (!result || result.format !== 'hypit.build-result@1') return null
  const outputs = Object.entries(result.outputs ?? {})
  const videos = []
  const images = []
  let fps = 30
  let frames = 0
  const windows = []
  for (const [name, output] of outputs) {
    const type = output?.type?.name
    const value = output?.value
    if (value?.kind === 'build-file' && typeof value.path === 'string') {
      const file = path.join(dir, value.path)
      if (!inside(file, dir)) continue
      if (VIDEO_TYPES.has(value.mediaType)) videos.push({ name, rel: value.path, bytes: value.size ?? 0, mediaType: value.mediaType })
      else if (IMAGE_TYPES.has(value.mediaType)) images.push({ name, rel: value.path, mediaType: value.mediaType })
    } else if (value?.kind === 'value' && typeof value.path === 'string' && (type === 'TemporalWindow' || type === 'Timeline')) {
      const file = path.join(dir, value.path)
      if (!inside(file, dir)) continue
      const data = (await readJson(file))?.value
      if (!data) continue
      if (type === 'Timeline') {
        const rate = data.frameRate
        if (rate?.numerator && rate?.denominator) fps = rate.numerator / rate.denominator
        if (Number.isInteger(data.frameCount)) frames = data.frameCount
      } else if (data.span && Number.isInteger(data.span.startFrame)) {
        windows.push({ id: data.id ?? name, start: data.span.startFrame, end: data.span.endFrameExclusive })
      }
    }
  }
  if (!videos.length) return null
  windows.sort((a, b) => a.start - b.start)
  const chapters = windows.map((window, index) => ({
    index,
    start: window.start / fps,
    end: window.end / fps,
    title: prettyName(window.id),
    purpose: '',
  }))
  const id = path.basename(dir)
  return {
    id,
    dir,
    source: result.source?.id ?? '',
    run: result.run?.id ?? '',
    targets: result.targets ?? [],
    outcome: result.outcome ?? '',
    finishedAt: Number.isFinite(result.finishedAt) ? new Date(result.finishedAt).toISOString() : null,
    duration: frames ? frames / fps : 0,
    fps,
    video: videos[0],
    videos,
    stills: images,
    chapters,
  }
}

/** All builds with a video, newest first. */
export async function listBuilds(projectRoot) {
  const results = path.join(projectRoot, '.hypit', 'results')
  const days = (await readdir(results).catch(() => [])).filter(name => DATE_DIR.test(name)).sort().reverse()
  const builds = []
  for (const day of days) {
    const ids = (await readdir(path.join(results, day)).catch(() => [])).filter(name => BUILD_ID.test(name)).sort().reverse()
    for (const id of ids) {
      const build = await readBuild(path.join(results, day, id))
      if (build) builds.push({ ...build, day })
      if (builds.length >= MAX_BUILDS) return builds
    }
  }
  return builds.sort((a, b) => String(b.finishedAt ?? b.id).localeCompare(String(a.finishedAt ?? a.id)))
}

/** Locate a build's video file, validating the id. */
export async function buildVideoPath(projectRoot, buildId, which = 0) {
  if (!BUILD_ID.test(String(buildId))) throw new Error('无效的构建标识')
  const builds = await listBuilds(projectRoot)
  const build = builds.find(item => item.id === buildId)
  if (!build) throw new Error('这个构建不存在或没有视频')
  const video = build.videos[Number(which) || 0] ?? build.video
  const file = path.join(build.dir, video.rel)
  if (!inside(file, path.join(projectRoot, '.hypit', 'results'))) throw new Error('无效的构建文件')
  return { file, mediaType: video.mediaType }
}

/** Read one chunk of a file as base64 (same protocol as 网感口播 media). */
export async function readChunk(file, offset = 0, mime = 'video/mp4', size = 256 * 1024) {
  const info = await stat(file)
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > info.size) throw new Error('无效媒体位置')
  const handle = await open(file, 'r')
  try {
    const buffer = Buffer.alloc(Math.min(size, info.size - offset))
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, offset)
    return { data: buffer.subarray(0, bytesRead).toString('base64'), size: info.size, next: offset + bytesRead, mime }
  } finally {
    await handle.close()
  }
}
