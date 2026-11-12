import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, extname, isAbsolute, join, resolve, sep } from 'node:path'
import { spawn } from 'node:child_process'

export const LIMITS = {
  roots: 12,
  depth: 4,
  projects: 120,
  files: 4000,
  filesPerProject: 400,
  docBytes: 4000,
  docExcerpt: 220,
}

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.hg',
  '.svn',
  'dist',
  '.next',
  '.cache',
  '.turbo',
  'coverage',
  'logs',
])

const SOURCE_EXT = new Set(['.svml', '.svs'])
const RUN_EXT = new Set(['.svrun'])
const MEDIA_EXT = new Set(['.mp4', '.mov', '.webm', '.m4v', '.mkv', '.wav', '.mp3', '.m4a', '.png', '.jpg', '.jpeg'])

export const SKILL_DIRS = [
  '~/.agents/skills/hypit/SKILL.md',
  '~/.claude/skills/hypit/SKILL.md',
  '~/.codex/skills/hypit/SKILL.md',
  '~/.config/hypit/skills/hypit/SKILL.md',
]

export function expandHome(input, home = homedir()) {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (trimmed === '~') return home
  if (trimmed.startsWith('~/')) return join(home, trimmed.slice(2))
  return trimmed
}

export function normalizePath(input) {
  if (typeof input !== 'string' || !input.trim()) return ''
  return resolve(input.trim()).replace(/[\\/]+$/u, '') || sep
}

export function isInside(child, parent) {
  const a = normalizePath(child)
  const b = normalizePath(parent)
  if (!a || !b) return false
  if (a === b) return true
  return a.startsWith(b.endsWith(sep) ? b : b + sep)
}

export function formatBytes(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value < 0) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(value < 10240 ? 1 : 0)} KB`
  if (value < 1024 * 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`
  return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`
}

export function parseProjectManifest(text) {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null
  if (data.hypit?.project !== true) return null
  return {
    name: typeof data.name === 'string' ? data.name : '',
    version: typeof data.version === 'string' ? data.version : '',
    title: typeof data.hypit?.title === 'string' ? data.hypit.title : '',
  }
}

export function firstHeading(text) {
  if (typeof text !== 'string') return ''
  for (const line of text.split(/\r?\n/u)) {
    const trimmed = line.trim()
    if (!trimmed) continue
    const heading = trimmed.match(/^#{1,3}\s+(.+)$/u)
    if (heading) return heading[1].trim()
    return trimmed.slice(0, 80)
  }
  return ''
}

export function excerpt(text, limit = LIMITS.docExcerpt) {
  if (typeof text !== 'string') return ''
  const body = text
    .replace(/^---[\s\S]*?---\s*/u, '')
    .replace(/\r\n/gu, '\n')
    .split('\n')
    .filter(line => line.trim() && !line.trim().startsWith('#'))
    .join(' ')
    .replace(/\s+/gu, ' ')
    .trim()
  if (body.length <= limit) return body
  return body.slice(0, limit - 1).trimEnd() + '…'
}

export function classifyFile(relPath) {
  const ext = extname(relPath).toLowerCase()
  if (SOURCE_EXT.has(ext)) return 'source'
  if (RUN_EXT.has(ext)) return 'run'
  if (ext === '.md' || ext === '.mdx') return 'doc'
  if (MEDIA_EXT.has(ext)) return 'result'
  return 'other'
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'))
  } catch {
    return null
  }
}

async function statFile(file) {
  try {
    const info = await stat(file)
    return info.isFile() ? info : null
  } catch {
    return null
  }
}

async function walk(rawRoot, options = {}) {
  const root = normalizePath(rawRoot)
  const maxDepth = options.maxDepth ?? 3
  const limit = options.limit ?? LIMITS.filesPerProject
  const out = []
  const queue = [{ dir: root, depth: 0 }]
  const seen = new Set()
  let visited = 0
  let truncated = false

  while (queue.length) {
    const { dir, depth } = queue.shift()
    if (seen.has(dir)) continue
    seen.add(dir)
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch {
      continue
    }
    entries.sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      if (out.length >= limit) {
        truncated = true
        break
      }
      if (entry.name.startsWith('.')) continue
      const abs = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (depth + 1 > maxDepth) continue
        if (SKIP_DIRS.has(entry.name)) continue
        queue.push({ dir: abs, depth: depth + 1 })
        continue
      }
      if (!entry.isFile()) continue
      visited += 1
      if (visited > LIMITS.files) {
        truncated = true
        break
      }
      const info = await statFile(abs)
      if (!info) continue
      out.push({
        rel: abs.slice(root.length + 1) || entry.name,
        abs,
        bytes: info.size,
        updatedAt: info.mtime.toISOString(),
        kind: classifyFile(entry.name),
      })
    }
    if (truncated) break
  }

  out.sort((left, right) => left.rel.localeCompare(right.rel))
  return { files: out, truncated }
}

export async function validateRoot(raw, options = {}) {
  const home = options.home ?? homedir()
  const dshHome = options.dshHome ?? join(home, '.dsh')
  const expanded = expandHome(raw, home)
  if (!expanded) return { path: '', ok: false, error: '没有填写扫描根目录。' }
  if (!isAbsolute(expanded)) return { path: expanded, ok: false, error: '扫描根目录需要使用绝对路径。' }
  const path = resolve(expanded)
  if (path === sep) return { path, ok: false, error: '不能扫描整个磁盘根目录。' }
  if (path === resolve(home)) return { path, ok: false, error: '请指向主目录下的具体视频项目目录，而不是整个主目录。' }
  if (isInside(path, dshHome)) return { path, ok: false, error: '不能扫描 DSH 的配置目录。' }
  try {
    const info = await stat(path)
    if (!info.isDirectory()) return { path, ok: false, error: '这个路径不是目录。' }
  } catch {
    return { path, ok: false, error: '这个目录不存在或不可读。' }
  }
  return { path, ok: true, error: '' }
}

export async function ensureRoot(raw, options = {}) {
  const home = options.home ?? homedir()
  const dshHome = options.dshHome ?? join(home, '.dsh')
  const checked = await validateRoot(raw, { home, dshHome })
  if (checked.ok) return { ...checked, created: false }

  const expanded = expandHome(raw, home)
  if (!expanded || !isAbsolute(expanded)) return { ...checked, created: false }
  const path = resolve(expanded)
  if (path === sep || path === resolve(home)) return { ...checked, created: false }
  if (isInside(path, dshHome)) return { ...checked, created: false }
  if (!isInside(path, home)) {
    return {
      path,
      ok: false,
      created: false,
      error: '这个目录不存在。自动创建只覆盖主目录内的路径，其他位置请先自行建好。',
    }
  }
  try {
    await mkdir(path, { recursive: true, mode: 0o755 })
  } catch {
    return { path, ok: false, created: false, error: '这个目录不存在，也无法自动创建。' }
  }
  const after = await validateRoot(path, { home, dshHome })
  return { ...after, created: after.ok }
}

async function readProjectSummary(root, options = {}) {
  const manifestInfo = await statFile(join(root, 'package.json'))
  let manifest = null
  if (manifestInfo) {
    const text = await readFile(join(root, 'package.json'), 'utf8').catch(() => '')
    manifest = parseProjectManifest(text)
  }
  if (!manifest) return null
  const walked = await walk(root, { maxDepth: options.depth ?? 2, limit: 120 })
  const counts = { source: 0, run: 0, doc: 0, result: 0 }
  for (const file of walked.files) {
    if (counts[file.kind] !== undefined) counts[file.kind] += 1
  }
  const updatedAt = walked.files.reduce(
    (newest, file) => (file.updatedAt > newest ? file.updatedAt : newest),
    manifestInfo.mtime.toISOString(),
  )
  return {
    id: root,
    root,
    name: manifest.name || basename(root),
    title: manifest.title || manifest.name || basename(root),
    version: manifest.version,
    updatedAt,
    counts,
    truncated: walked.truncated,
  }
}

export async function discoverProjects(root, options = {}) {
  const maxDepth = options.depth ?? LIMITS.depth
  const maxProjects = options.maxProjects ?? LIMITS.projects
  const projects = []
  const problems = []
  let truncated = false
  const queue = [{ dir: root, depth: 0 }]
  const seen = new Set()

  while (queue.length) {
    const { dir, depth } = queue.shift()
    if (seen.has(dir)) continue
    seen.add(dir)
    let entries
    try {
      entries = await readdir(dir, { withFileTypes: true })
    } catch (error) {
      if (dir === root) problems.push({ root, message: '目录不可读。' })
      continue
    }
    entries.sort((left, right) => left.name.localeCompare(right.name))
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('.')) continue
      if (SKIP_DIRS.has(entry.name)) continue
      const abs = join(dir, entry.name)
      const summary = await readProjectSummary(abs, { depth: 2 })
      if (summary) {
        if (projects.length >= maxProjects) {
          truncated = true
          break
        }
        projects.push(summary)
        continue
      }
      if (depth + 1 <= maxDepth) queue.push({ dir: abs, depth: depth + 1 })
    }
    if (truncated) break
  }

  projects.sort((left, right) => (left.updatedAt < right.updatedAt ? 1 : -1))
  return { projects, problems, truncated }
}

export async function readProjectDetail(root, options = {}) {
  const walked = await walk(root, { maxDepth: options.maxDepth ?? 3, limit: LIMITS.filesPerProject })
  const manifestFile = await statFile(join(root, 'package.json'))
  const manifestText = manifestFile ? await readFile(join(root, 'package.json'), 'utf8').catch(() => '') : ''
  const manifest = parseProjectManifest(manifestText)

  const sources = walked.files.filter(file => file.kind === 'source')
  const runs = walked.files.filter(file => file.kind === 'run')
  const results = walked.files.filter(file => file.kind === 'result')
  const docFiles = walked.files.filter(file => file.kind === 'doc' && !file.rel.includes(sep + 'node_modules' + sep))

  const docs = []
  for (const file of docFiles.slice(0, 6)) {
    const info = await statFile(file.abs)
    if (!info || info.size > 400_000) continue
    const text = await readFile(file.abs, 'utf8').catch(() => '')
    if (!text) continue
    docs.push({
      rel: file.rel,
      title: firstHeading(text) || basename(file.rel, extname(file.rel)),
      excerpt: excerpt(text.slice(0, LIMITS.docBytes)),
      bytes: file.bytes,
      updatedAt: file.updatedAt,
    })
  }

  const updatedAt = walked.files.reduce(
    (newest, file) => (file.updatedAt > newest ? file.updatedAt : newest),
    new Date(0).toISOString(),
  )

  return {
    id: root,
    root,
    name: manifest?.name || basename(root),
    title: manifest?.title || manifest?.name || basename(root),
    version: manifest?.version || '',
    updatedAt,
    sources: sources.slice(0, 60).map(file => ({
      rel: file.rel,
      bytes: file.bytes,
      updatedAt: file.updatedAt,
    })),
    runs: runs.slice(0, 20).map(file => ({ rel: file.rel, bytes: file.bytes, updatedAt: file.updatedAt })),
    results: results.slice(0, 24).map(file => ({ rel: file.rel, bytes: file.bytes, updatedAt: file.updatedAt })),
    docs,
    counts: {
      source: sources.length,
      run: runs.length,
      doc: docFiles.length,
      result: results.length,
    },
    truncated: walked.truncated,
  }
}

export async function readSource(root, rel) {
  const safeRel = typeof rel === 'string' ? rel.trim() : ''
  if (!safeRel || safeRel.includes('\0')) throw Object.assign(new Error('源文件路径无效。'), { code: 'invalid-source' })
  const abs = resolve(root, safeRel)
  if (!isInside(abs, root)) throw Object.assign(new Error('源文件不在这个项目内。'), { code: 'invalid-source' })
  if (!SOURCE_EXT.has(extname(abs).toLowerCase()) && extname(abs).toLowerCase() !== '.svrun') {
    throw Object.assign(new Error('只能读取 SVML 源码或 SVRun 文件。'), { code: 'invalid-source' })
  }
  const info = await statFile(abs)
  if (!info) throw Object.assign(new Error('这个源文件已不存在。'), { code: 'source-not-found' })
  if (info.size > 512_000) throw Object.assign(new Error('源文件超过 500 KB，请直接在编辑器里查看。'), { code: 'source-too-large' })
  const text = await readFile(abs, 'utf8')
  const lines = text.split(/\r?\n/u)
  return {
    rel: safeRel,
    bytes: info.size,
    updatedAt: info.mtime.toISOString(),
    lines: lines.slice(0, 400),
    lineCount: lines.length,
    truncated: lines.length > 400,
  }
}

function candidateNames() {
  return process.platform === 'win32' ? ['hypit.cmd', 'hypit.exe', 'hypit'] : ['hypit']
}

export function findOnPath(names, pathValue = process.env.PATH ?? '') {
  for (const dir of pathValue.split(process.platform === 'win32' ? ';' : ':')) {
    if (!dir) continue
    for (const name of names) {
      const candidate = join(dir, name)
      if (existsSync(candidate)) return candidate
    }
  }
  return ''
}

async function runVersion(executable) {
  return await new Promise(resolvePromise => {
    let settled = false
    let timer
    const finish = value => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      resolvePromise(value)
    }
    try {
      const child = spawn(executable, ['--version'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 4000,
        env: { ...process.env, NO_COLOR: '1' },
      })
      let output = ''
      child.stdout?.on('data', chunk => { output += String(chunk) })
      child.stderr?.on('data', chunk => { output += String(chunk) })
      child.on('error', () => finish({ version: '', error: '无法执行这个文件。' }))
      child.on('close', code => {
        const line = output.split(/\r?\n/u).map(item => item.trim()).find(Boolean) ?? ''
        finish({ version: code === 0 ? line.slice(0, 40) : '', error: code === 0 ? '' : `退出码 ${code}` })
      })
      timer = setTimeout(() => {
        try { child.kill('SIGTERM') } catch {}
        finish({ version: '', error: '检查超时。' })
      }, 4000)
    } catch {
      finish({ version: '', error: '无法执行这个文件。' })
    }
  })
}

export const RUN_LIMITS = { timeoutMs: 90_000, outputChars: 20_000 }

const RUN_SOURCE_EXT = new Set(['.svml', '.svs'])
const PLAN_SOURCE_EXT = new Set(['.svrun'])

export function validateCommandSource(rel, mode) {
  const text = typeof rel === 'string' ? rel.trim() : ''
  if (!text || text.includes('\0') || isAbsolute(text) || text.split(/[\\/]+/u).includes('..')) {
    throw Object.assign(new Error('源文件路径无效。'), { code: 'invalid-source' })
  }
  const ext = extname(text).toLowerCase()
  if (mode === 'check' && !RUN_SOURCE_EXT.has(ext)) {
    throw Object.assign(new Error('校验只接受 .svml 或 .svs 源文件。'), { code: 'invalid-source' })
  }
  if (mode === 'plan' && !PLAN_SOURCE_EXT.has(ext)) {
    throw Object.assign(new Error('规划只接受 .svrun 运行文件。'), { code: 'invalid-source' })
  }
  return text
}

function trimOutput(text) {
  const value = typeof text === 'string' ? text : ''
  if (value.length <= RUN_LIMITS.outputChars) return value
  return value.slice(0, RUN_LIMITS.outputChars).trimEnd() + '\n…（输出过长，已截断）'
}

export async function runHypit(executable, args, options = {}) {
  const started = Date.now()
  return await new Promise(resolvePromise => {
    let settled = false
    let timer
    const finish = value => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      resolvePromise({ ...value, durationMs: Date.now() - started })
    }
    try {
      const child = spawn(executable, args, {
        cwd: options.cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', CI: '1' },
      })
      let stdout = ''
      let stderr = ''
      child.stdout?.on('data', chunk => { stdout += String(chunk) })
      child.stderr?.on('data', chunk => { stderr += String(chunk) })
      child.on('error', error => finish({ ok: false, code: -1, stdout: '', stderr: String(error?.message ?? '无法执行 hypit。'), timedOut: false }))
      child.on('close', code => finish({
        ok: code === 0,
        code: typeof code === 'number' ? code : -1,
        stdout: trimOutput(stdout),
        stderr: trimOutput(stderr),
        timedOut: false,
      }))
      timer = setTimeout(() => {
        try { child.kill('SIGTERM') } catch {}
        finish({
          ok: false,
          code: -1,
          stdout: trimOutput(stdout),
          stderr: trimOutput(stderr) || `超过 ${Math.round((options.timeout ?? RUN_LIMITS.timeoutMs) / 1000)} 秒没有结束。`,
          timedOut: true,
        })
      }, options.timeout ?? RUN_LIMITS.timeoutMs)
    } catch {
      finish({ ok: false, code: -1, stdout: '', stderr: '无法执行 hypit。', timedOut: false })
    }
  })
}

export async function detectExecutor(projectRoots = []) {
  const candidates = []
  const onPath = findOnPath(candidateNames())
  if (onPath) candidates.push({ path: onPath, source: 'PATH' })
  for (const root of projectRoots) {
    const local = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'hypit.cmd' : 'hypit')
    if (existsSync(local)) candidates.push({ path: local, source: '项目依赖' })
  }
  if (!candidates.length) {
    return { found: false, path: '', version: '', source: '', error: '' }
  }
  const first = candidates[0]
  const result = await runVersion(first.path)
  return {
    found: true,
    path: first.path,
    source: first.source,
    version: result.version,
    error: result.error,
  }
}

export async function detectSkill(dirPatterns = SKILL_DIRS, home = homedir()) {
  for (const pattern of dirPatterns) {
    const file = expandHome(pattern, home)
    const info = await statFile(file)
    if (!info) continue
    const text = await readFile(file, 'utf8').catch(() => '')
    const name = text.match(/^name:\s*(.+)$/mu)?.[1]?.trim() ?? ''
    return {
      found: true,
      path: file,
      name: name || 'hypit',
      updatedAt: info.mtime.toISOString(),
    }
  }
  return { found: false, path: '', name: '', updatedAt: '' }
}

export function nodeStatus(version = process.versions.node) {
  const [major, minor] = String(version).split('.').map(Number)
  const ok = Number.isFinite(major) && (major > 22 || (major === 22 && (minor ?? 0) >= 15))
  return { version: String(version), ok }
}

export async function readJsonSafe(file) {
  return await readJson(file)
}

/** True when the directory itself is a Hypit project (package.json marks it). */
export async function isHypitProject(root) {
  const path = typeof root === 'string' ? root.trim() : ''
  if (!path) return false
  const manifest = await statFile(join(path, 'package.json'))
  if (!manifest) return false
  const text = await readFile(join(path, 'package.json'), 'utf8').catch(() => '')
  return parseProjectManifest(text) !== null
}

/** Folder names a new project may use: letters, digits, CJK, dot, dash, underscore. */
export function slugifyProjectName(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/gu, '-')
    .replace(/[^\p{L}\p{N}._-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 64)
}

function packageNameFor(slug) {
  const ascii = slug.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-{2,}/g, '-').replace(/^[._-]+|[._-]+$/g, '')
  return ascii && ascii.length >= Math.min(3, slug.length) && /[a-z]/.test(ascii) && !/[^\x00-\x7f]/.test(slug) ? ascii : `hypit-${ascii || 'video'}`
}

/**
 * Create a minimal Hypit project: `<root>/<name>/package.json` with the
 * project marker, plus `notes/brief.md` when a brief is given. Never
 * overwrites an existing folder.
 */
export async function createProject(root, rawName, brief = '', options = {}) {
  const checked = await validateRoot(root, options)
  if (!checked.ok) throw Object.assign(new Error(checked.error), { code: 'invalid-root' })
  const name = slugifyProjectName(rawName)
  if (!name) throw Object.assign(new Error('项目名只能用字母、数字、中文、点、横线和下划线。'), { code: 'invalid-name' })
  const dir = join(checked.path, name)
  if (!isInside(dir, checked.path) || dir === checked.path) {
    throw Object.assign(new Error('项目名不合法。'), { code: 'invalid-name' })
  }
  if (existsSync(dir)) throw Object.assign(new Error(`「${name}」已经存在，换个名字。`), { code: 'project-exists' })
  await mkdir(dir, { recursive: false, mode: 0o755 })
  const manifest = {
    name: packageNameFor(name),
    version: '0.0.0',
    private: true,
    type: 'module',
    hypit: { project: true, ...(name !== packageNameFor(name) ? { title: name } : {}) },
  }
  await writeFile(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' })
  const text = String(brief ?? '').trim().slice(0, 2000)
  if (text) {
    await mkdir(join(dir, 'notes'), { recursive: true })
    await writeFile(join(dir, 'notes', 'brief.md'), `# ${name}\n\n${text}\n`, { flag: 'wx' })
  }
  return { root: dir, name }
}
