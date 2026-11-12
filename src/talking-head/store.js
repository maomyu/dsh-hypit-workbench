import { randomUUID } from 'node:crypto'
import { mkdir, readFile, writeFile, rename, readdir, copyFile, stat, realpath, rm, open } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { run, executable } from './process.js'

export const PACKAGE_ROOT = fileURLToPath(new URL('../../', import.meta.url))
export const SKILL_ROOT = path.join(PACKAGE_ROOT, 'vendor/wanggan')
const read = async file => JSON.parse(await readFile(file, 'utf8'))
export async function atomic(file, value) {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = file + '.' + randomUUID() + '.tmp'
  try { await writeFile(temp, JSON.stringify(value, null, 2) + '\n'); await rename(temp, file) }
  finally { await rm(temp, { force: true }) }
}
const idPattern = /^[a-f\d-]{36}$/u
const checkId = id => { if (typeof id !== 'string' || !idPattern.test(id)) throw new Error('无效工程标识'); return id }
export function validateTranscript(value, duration) {
  if (!Array.isArray(value) || value.length > 20000) throw new Error('字幕需为带 start/end/text 的数组')
  let end = 0
  return value.map(row => {
    if (!Number.isFinite(row.start) || !Number.isFinite(row.end) || row.start < end - .04 || row.end <= row.start || row.end > duration + .1 || typeof row.text !== 'string' || row.text.length > 1000)
      throw new Error('字幕时间或文字无效')
    end = row.end
    return { start: Math.max(0, row.start), end: Math.min(duration, row.end), text: row.text.trim() }
  })
}
export function keepRanges(project) {
  const deleted = new Set(project.deleted)
  const cuts = project.transcript.filter((_, index) => deleted.has(index))
  const ranges = []
  let cursor = 0
  for (const cut of cuts) {
    if (cut.start > cursor + .01) ranges.push([cursor, cut.start])
    cursor = Math.max(cursor, cut.end)
  }
  if (project.duration > cursor + .01) ranges.push([cursor, project.duration])
  if (!ranges.length) throw new Error('至少保留一段原片')
  return ranges
}

export class StudioStore {
  constructor(directory, options = {}) {
    if (!path.isAbsolute(directory)) throw new Error('工程存储目录必须为绝对路径')
    this.directory = directory
    this.node = options.node ?? process.execPath
    this.python = options.python ?? executable('python3')
    this.jobs = new Map()
    this.locks = new Map()
    this.closed = false
    this.previews = new Map()
    this.previewLifetime = new AbortController()
  }
  root(id) { return path.join(this.directory, 'projects', checkId(id)) }
  file(id) { return path.join(this.root(id), 'workbench.json') }
  async get(id) { return read(this.file(id)) }
  async list() {
    const folder = path.join(this.directory, 'projects')
    await mkdir(folder, { recursive: true })
    const projects = []
    for (const id of await readdir(folder)) {
      if (!idPattern.test(id)) continue
      try { projects.push(await this.get(id)) } catch (error) { if (error.code !== 'ENOENT') throw error }
    }
    return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  async exclusive(id, work) {
    const prior = this.locks.get(id) ?? Promise.resolve()
    const pending = prior.catch(() => {}).then(work)
    this.locks.set(id, pending)
    try { return await pending }
    finally { if (this.locks.get(id) === pending) this.locks.delete(id) }
  }
  async probe(file, signal) {
    const info = JSON.parse(await run(executable('ffprobe'), ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', file], { signal }))
    const stream = info.streams.find(row => row.codec_type === 'video')
    const duration = Number(info.format.duration)
    if (!stream || !Number.isFinite(duration) || duration < .1 || duration > 3600) throw new Error('需导入 0.1 秒至 60 分钟的视频')
    return { duration, width: stream.width, height: stream.height, hasAudio: info.streams.some(row => row.codec_type === 'audio') }
  }
  async import(input, signal) {
    if (input.owned !== true) throw new Error('请确认素材为本次明确选择的自有口播')
    if (typeof input.source !== 'string' || !path.isAbsolute(input.source)) throw new Error('请输入视频的本地绝对路径')
    const source = await realpath(input.source)
    if (!(await stat(source)).isFile()) throw new Error('源素材需要是文件')
    const info = await this.probe(source, signal)
    const transcript = input.transcript ? validateTranscript(input.transcript, info.duration) : []
    const id = randomUUID()
    const root = this.root(id)
    try {
      await mkdir(path.join(root, 'assets'), { recursive: true })
      await mkdir(path.join(root, 'outputs'), { recursive: true })
      await copyFile(source, path.join(root, 'assets/master.mp4'))
      const project = { id, name: String(input.name || path.basename(source)).slice(0, 160), ...info,
        revision: 0, transcript, deleted: [], versions: [], sessionId: null, operations: [],
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      await atomic(this.file(id), project)
      return { project }
    } catch (error) { await rm(root, { recursive: true, force: true }); throw error }
  }
  async update(input, mutate) {
    return this.exclusive(input.projectId, async () => {
      const project = await this.get(input.projectId)
      if (typeof input.operationId !== 'string' || input.operationId.length > 100) throw new Error('需要操作标识')
      if (project.operations.includes(input.operationId)) return { project }
      if (input.revision !== project.revision) throw new Error('工程已更新，请刷新后再操作')
      if ([...this.jobs.values()].some(job => job.projectId === project.id && job.status === 'running')) throw new Error('请先完成或取消当前任务')
      await mutate(project)
      project.revision += 1
      project.updatedAt = new Date().toISOString()
      project.operations = [...project.operations.slice(-99), input.operationId]
      await atomic(this.file(project.id), project)
      return { project }
    })
  }
  async edit(input) {
    return this.update(input, project => {
      if (!['cut', 'restore'].includes(input.action) || !Array.isArray(input.indices)) throw new Error('无效选区操作')
      const selected = new Set(project.deleted)
      for (const index of input.indices) {
        if (!Number.isSafeInteger(index) || !project.transcript[index]) throw new Error('原句已变化，请重新选择')
        input.action === 'cut' ? selected.add(index) : selected.delete(index)
      }
      project.deleted = [...selected].sort((a, b) => a - b)
      keepRanges(project)
    })
  }
  async start(input, operation) {
    return this.exclusive(input.projectId, async () => {
      const project = await this.get(input.projectId)
      if (typeof input.operationId !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/u.test(input.operationId)) throw new Error('需要有效的任务请求标识')
      const jobFile = path.join(this.root(project.id), 'jobs', input.operationId.replace(/[^a-zA-Z0-9_-]/gu, '_') + '.json')
      let previous
      try { previous = await read(jobFile) } catch (error) { if (error.code !== 'ENOENT') throw error }
      if (previous) {
        if (previous.status === 'running' && !this.jobs.has(previous.id)) {
          previous.status = 'failed'; previous.error = '上次任务因宿主重启中断，可使用新的请求标识重试'; await atomic(jobFile, previous)
        }
        return { job: previous }
      }
      if (project.revision !== input.revision) throw new Error('工程已更新，请刷新后再操作')
      if ([...this.jobs.values()].some(job => job.projectId === project.id && job.status === 'running')) throw new Error('同一工程正在制作中')
      const job = { id: randomUUID(), projectId: project.id, kind: input.op, status: 'running', log: '', startedAt: new Date().toISOString(), file: jobFile }
      const controller = new AbortController()
      this.jobs.set(job.id, job)
      job.controller = controller
      const snapshot = () => ({ ...job, controller: undefined, promise: undefined })
      await atomic(jobFile, snapshot())
      job.promise = Promise.resolve().then(async () => {
        if (this.closed) throw new Error('插件已关闭')
        await operation(project, controller.signal, line => { job.log = (job.log + line + '\n').slice(-20000) })
        job.status = 'succeeded'
      }).catch(error => { job.status = controller.signal.aborted ? 'cancelled' : 'failed'; job.error = error.message })
        .finally(async () => { job.finishedAt = new Date().toISOString(); await atomic(jobFile, snapshot()) })
      return { job: snapshot() }
    })
  }
  async job(input) {
    await this.get(input.projectId)
    const job = this.jobs.get(input.jobId)
    if (job?.projectId === input.projectId) return { job: { ...job, controller: undefined, promise: undefined } }
    const folder = path.join(this.root(input.projectId), 'jobs')
    for (const name of await readdir(folder).catch(() => [])) {
      const saved = await read(path.join(folder, name))
      if (saved.id === input.jobId) return { job: saved.status === 'running' ? { ...saved, status: 'failed', error: '宿主重启中断了任务' } : saved }
    }
    throw new Error('任务不存在')
  }
  async latestJob(projectId) {
    const live = [...this.jobs.values()].filter(job => job.projectId === projectId).sort((a,b) => b.startedAt.localeCompare(a.startedAt))[0]
    if (live) return (await this.job({ projectId, jobId: live.id })).job
    const folder = path.join(this.root(projectId), 'jobs')
    const saved = await Promise.all((await readdir(folder).catch(() => [])).filter(name => name.endsWith('.json')).map(name => read(path.join(folder, name))))
    const latest = saved.sort((a,b) => b.startedAt.localeCompare(a.startedAt))[0]
    return latest ? (await this.job({ projectId, jobId: latest.id })).job : null
  }
  async render(project, signal, onLine) {
    const root = this.root(project.id)
    const ranges = keepRanges(project)
    const versionId = randomUUID()
    const output = path.join(root, 'outputs', versionId + '.mp4')
    const temporary = output + '.tmp.mp4'
    const source = path.join(root, 'assets/master.mp4')
    const filters = ranges.map(([start,end], index) => `[0:v:0]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${index}];` +
      (project.hasAudio ? `[0:a:0]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${index}];` : '')).join('') +
      ranges.map((_,index) => `[v${index}]` + (project.hasAudio ? `[a${index}]` : '')).join('') +
      `concat=n=${ranges.length}:v=1:a=${project.hasAudio ? 1 : 0}[v]${project.hasAudio ? '[a]' : ''}`
    const filterFile = path.join(root, 'outputs', versionId + '.filters.txt')
    try {
      await writeFile(filterFile, filters)
      await run(executable('ffmpeg'), ['-nostdin', '-v', 'error', '-i', source, '-/filter_complex', filterFile,
        '-map','[v]', ...(project.hasAudio ? ['-map','[a]'] : []), '-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p',
        '-c:a','aac','-b:a','160k','-threads','4','-movflags','+faststart', temporary], { signal, onLine })
      const info = await this.probe(temporary, signal)
      const expected = ranges.reduce((total, [start,end]) => total + end - start, 0)
      if (Math.abs(info.duration - expected) > .15 || info.hasAudio !== project.hasAudio) throw new Error('成片时长或原声校验未通过')
      signal.throwIfAborted()
      await rename(temporary, output)
      project.versions.push({ id: versionId, duration: info.duration, label: '剪辑版本 ' + (project.versions.length + 1), revision: project.revision, createdAt: new Date().toISOString() })
      project.revision += 1
      project.updatedAt = new Date().toISOString()
      await atomic(this.file(project.id), project)
    } finally { await Promise.all([rm(temporary, { force: true }), rm(filterFile, { force: true })]) }
  }
  async transcribe(project, signal, onLine) {
    const output = await run(this.python, [path.join(PACKAGE_ROOT, 'src/talking-head/transcribe.py'), path.join(this.root(project.id), 'assets/master.mp4')], { signal, onLine })
    const array = output.trim().split('\n').findLast(line => line.startsWith('['))
    if (!array) throw new Error('识别未返回字幕，请检查本地 faster-whisper 模型')
    project.transcript = validateTranscript(JSON.parse(array), project.duration)
    project.deleted = []
    project.revision += 1
    project.updatedAt = new Date().toISOString()
    await atomic(this.file(project.id), project)
  }
  async media(input, signal) {
    const project = await this.get(input.projectId)
    const root = this.root(project.id)
    let file = path.join(root, 'assets/master.mp4')
    if (input.version && input.version !== 'source') {
      if (!project.versions.some(row => row.id === input.version)) throw new Error('成片版本不存在')
      file = path.join(root, 'outputs', checkId(input.version) + '.mp4')
    }
    if (input.compat === true) file = await this.compatiblePreview(project.id, input.version ?? 'source', file)
    const info = await stat(file)
    const offset = input.offset ?? 0
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > info.size) throw new Error('无效媒体位置')
    signal?.throwIfAborted()
    const handle = await open(file, 'r')
    try {
      const buffer = Buffer.alloc(Math.min(256 * 1024, info.size - offset))
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, offset)
      return { data: buffer.subarray(0, bytesRead).toString('base64'), size: info.size, next: offset + bytesRead, mime: input.compat ? 'video/webm' : 'video/mp4' }
    } finally { await handle.close() }
  }
  async compatiblePreview(id, version, source) {
    const key = id + '/' + version
    if (this.previews.has(key)) return this.previews.get(key)
    const target = path.join(this.root(id), 'previews', version + '.webm')
    const generate = (async () => {
      try { if ((await stat(target)).isFile()) return target } catch (error) { if (error.code !== 'ENOENT') throw error }
      await mkdir(path.dirname(target), { recursive: true })
      const temp = target + '.' + randomUUID() + '.webm'
      try {
        await run(executable('ffmpeg'), ['-nostdin','-v','error','-i',source,
          '-vf',"scale=w='min(540,iw)':h='min(960,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
          '-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','6','-crf','34','-b:v','0','-threads','4',
          '-c:a','libopus','-b:a','96k',temp], { signal: this.previewLifetime.signal })
        await rename(temp,target)
        return target
      } finally { await rm(temp,{force:true}) }
    })()
    this.previews.set(key,generate)
    try { return await generate } finally { this.previews.delete(key) }
  }
  async projectPath(id, relative, writing = false) {
    const root = await realpath(this.root(id))
    const target = path.resolve(root, relative)
    if (!target.startsWith(root + path.sep) || relative.includes('\\')) throw new Error('路径超出当前口播工程')
    if (writing && !/^creative(?:-[a-f\d-]{36})?\/(?:plans\/|scripts\/|(?:scene-plan|timing|edit-plan|facts|font-usage|hyperframes|orchestration)\.json$|selection-rationale\.md$|index\.html$|index\.motion\.json$)/u.test(relative)) throw new Error('仅能写入当前工程的方案与制作代码')
    if (writing) await mkdir(path.dirname(target), { recursive: true })
    const actual = await realpath(writing ? path.dirname(target) : target)
    if (actual !== root && !actual.startsWith(root + path.sep)) throw new Error('不允许访问工程外的软链接')
    if (writing) {
      try { if (await realpath(target) !== target) throw new Error('不允许写入软链接') } catch (error) { if (error.code !== 'ENOENT') throw error }
    }
    return target
  }
  async dispose() {
    this.closed = true
    this.previewLifetime.abort()
    for (const job of this.jobs.values()) if (job.status === 'running') job.controller.abort()
    await Promise.allSettled([...this.jobs.values()].map(job => job.promise).concat([...this.previews.values()]))
  }
}
