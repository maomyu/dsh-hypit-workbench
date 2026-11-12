/**
 * Finished films (成片) for a talking-head clip.
 *
 * A finished film is a `project.versions[]` entry whose MP4 lives in
 * `outputs/<id>.mp4`. Creative versions also have a production folder
 * (`creative-…`) with a poster, a 16-frame contact sheet, the scene plan and
 * the recipe. New adoptions record that folder on the version; older ones are
 * matched by file size + SHA-256 of the head so existing films still get
 * their cover and chapters.
 */
import { createHash } from 'node:crypto'
import { open, readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const HEAD = 4 * 1024 * 1024

async function headHash(file) {
  const handle = await open(file, 'r')
  try {
    const buffer = Buffer.alloc(HEAD)
    const { bytesRead } = await handle.read(buffer, 0, HEAD, 0)
    return createHash('sha256').update(buffer.subarray(0, bytesRead)).digest('hex')
  } finally {
    await handle.close()
  }
}

async function readJson(file) {
  try { return JSON.parse(await readFile(file, 'utf8')) } catch { return null }
}

async function fileSize(file) {
  try { return (await stat(file)).size } catch { return -1 }
}

/** Find the creative folder whose final.mp4 is byte-identical to a version. */
export async function matchCreative(root, versionId, hint) {
  const output = path.join(root, 'outputs', versionId + '.mp4')
  const size = await fileSize(output)
  if (size < 0) return null
  const candidates = hint ? [hint] : (await readdir(root).catch(() => [])).filter(name => /^creative(?:-[\w-]+)?$/u.test(name))
  let hash = null
  for (const name of candidates) {
    const final = path.join(root, name, 'outputs/final.mp4')
    if ((await fileSize(final)) !== size) continue
    hash ??= await headHash(output)
    if ((await headHash(final)) === hash) return name
  }
  return null
}

/** Chapters from the scene plan + headline cues, in seconds. */
export function chaptersOf(scenePlan, semanticPlan) {
  const fps = Number(scenePlan?.fps) || 30
  const heads = Array.isArray(semanticPlan?.headlines) ? semanticPlan.headlines : []
  const titleAt = frame => {
    let title = ''
    for (const [start, text] of heads) if (Number(start) <= frame) title = String(text)
    return title.replace(/\s+/g, ' ').replace(/[？?]$/u, '').trim()
  }
  return (scenePlan?.scenes ?? []).map((scene, index) => ({
    index,
    start: scene.startFrame / fps,
    end: scene.endFrame / fps,
    title: titleAt(scene.startFrame) || '第 ' + (index + 1) + ' 段',
    purpose: String(scene.purpose ?? '').slice(0, 60),
  }))
}

/** Everything the panel needs to present one finished film. */
export async function filmDetail(root, version) {
  const folder = version.creativeDirectory ?? await matchCreative(root, version.id)
  const base = {
    id: version.id,
    label: version.label,
    duration: version.duration,
    createdAt: version.createdAt,
    kind: folder ? 'creative' : 'cut',
    folder: folder ?? null,
    style: null,
    orchestration: null,
    chapters: [],
    hasPoster: false,
    hasContact: false,
    verified: false,
  }
  if (!folder) return base
  const dir = path.join(root, folder)
  const [recipe, orchestration, scenePlan, semanticPlan, project, poster, contact] = await Promise.all([
    readJson(path.join(dir, 'recipe.json')),
    readJson(path.join(dir, 'orchestration.json')),
    readJson(path.join(dir, 'scene-plan.json')),
    readJson(path.join(dir, 'plans/semantic-plan.json')),
    readJson(path.join(dir, 'project.json')),
    fileSize(path.join(dir, 'outputs/poster.jpg')),
    fileSize(path.join(dir, 'outputs/contact.jpg')),
  ])
  return {
    ...base,
    style: recipe?.name ? String(recipe.name).split('·')[0].trim() : null,
    orchestration: orchestration?.profile?.name ?? null,
    chapters: chaptersOf(scenePlan, semanticPlan),
    hasPoster: poster > 0,
    hasContact: contact > 0,
    verified: project?.status === 'verified',
  }
}

/** Resolve the image file for a film still, guarding the name. */
export async function filmImagePath(root, version, which) {
  if (!['poster', 'contact'].includes(which)) throw new Error('无效的成片图片')
  const folder = version.creativeDirectory ?? await matchCreative(root, version.id)
  if (!folder) throw new Error('这个版本没有制作工程，没有封面')
  return path.join(root, folder, 'outputs', which + '.jpg')
}
