/**
 * 网感口播 inside 视频工作台.
 *
 * Owns clip storage (~/.dsh/wanggan-talking-head, kept for continuity with
 * the old plugin), the bundled production kit under vendor/wanggan, the
 * `wanggan_studio` agent tool and the bundled skills. The host service routes
 * every `th_*` panel op here.
 */
import { defineTool } from '@deepseek-ai/dsh-tools'
import { copyFile, mkdir, readdir, readFile, realpath, stat, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import { StudioStore, SKILL_ROOT, atomic, validateTranscript } from './store.js'
import { executable, run } from './process.js'
import { optionsArgs, projectCommands, readOnlyCommands } from './commands.js'
import { VideoUploads } from './uploads.js'
import { ClipBindings, resolveClipRequest } from './bindings.js'
import { artStyle, artStyleBranches, artStyleComponents, artStyleOrchestrations, artStyles, visualPreferences } from './art-styles.js'
import { ImageSettings } from './image-provider.js'
import { ImageAssets } from './image-assets.js'
import { IMAGE_GUIDANCE } from './image-guidance.js'
import { normalizeOrchestration, orchestrationIds } from './orchestration.js'
import { summarizeCheck } from './check-summary.js'
import { filmDetail, filmImagePath } from './films.js'

export const TOOL_NAME = 'wanggan_studio'

async function skillFile(relative) {
  const root = await realpath(SKILL_ROOT)
  const file = await realpath(path.resolve(root, String(relative ?? '')))
  if (!file.startsWith(root + path.sep) || !/\.(?:md|json|mjs|py|txt)$/u.test(file)) throw new Error('只能读取随包技能、配方和实现文件')
  const info = await stat(file)
  if (info.size > 1024 * 1024) throw new Error('技能文件过大，请按引用逐份阅读')
  const extra = String(relative).startsWith('skills/') && String(relative).endsWith('/SKILL.md') ? IMAGE_GUIDANCE : ''
  return { path: file, content: await readFile(file, 'utf8') + extra }
}

const RUNTIME_NOTE = '\n\n## 视频工作台运行入口\n先调用 wanggan_studio 的 {"op":"context"} 读取当前对话绑定的口播，不需要让用户提供工程 ID。project.visualPreferences 是用户在工作台里选定的母画风、分支、组件与编排，必须继承；当前正式入口为 19 套母画风。init 使用 options.recipe、branch、components、orchestration，不退回旧 options.style。仅用户要求更换时用 art_style 更新。异步任务返回 jobId 后持续用 job 查询到结束。init 之后按本片内容实际设计，再 run 和 adopt，成片会出现在工作台的版本列表里。'

function skillProvider() {
  const entries = readdir(path.join(SKILL_ROOT, 'skills'))
  const list = async () => Promise.all((await entries).map(async name => {
    const locator = 'skills/' + name + '/SKILL.md'
    const raw = (await skillFile(locator)).content
    const description = /^description:\s*(.+)$/mu.exec(raw)?.[1] ?? '网感口播专业制作模块'
    return {
      name, description, invocation: { modelInvocable: true, userInvocable: true },
      source: 'bundled', provider: 'video-workbench-talking-head', rank: 600, locator,
      path: path.join(SKILL_ROOT, locator), resourceBase: { kind: 'directory', path: path.join(SKILL_ROOT, 'skills', name) },
    }
  }))
  return {
    name: 'video-workbench-talking-head',
    list,
    async get(candidate) {
      const raw = (await skillFile(candidate.locator)).content
      return { ...candidate, content: raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/u, '') + RUNTIME_NOTE }
    },
  }
}

function srtTime(seconds) {
  const ticks = Math.round(seconds * 1000)
  return [Math.floor(ticks / 3600000), Math.floor(ticks / 60000) % 60, Math.floor(ticks / 1000) % 60]
    .map(n => String(n).padStart(2, '0')).join(':') + ',' + String(ticks % 1000).padStart(3, '0')
}

/** Strip heavy fields before sending a project to the panel. */
export function clipSummary(project) {
  const kept = project.transcript.length - project.deleted.length
  const keptSeconds = project.transcript.reduce((sum, line, index) => sum + (project.deleted.includes(index) ? 0 : line.end - line.start), 0)
  return {
    id: project.id,
    name: project.name,
    duration: project.duration,
    width: project.width,
    height: project.height,
    hasAudio: project.hasAudio,
    revision: project.revision,
    lines: project.transcript.length,
    keptLines: kept,
    cutSeconds: project.transcript.length ? project.transcript.reduce((sum, line, index) => sum + (project.deleted.includes(index) ? line.end - line.start : 0), 0) : 0,
    keptSeconds,
    versions: project.versions.length,
    latestVersion: project.versions.at(-1) ?? null,
    style: project.visualPreferences?.style ? { id: project.visualPreferences.style.id, name: project.visualPreferences.style.name } : null,
    creative: Boolean(project.creativeDirectory) || undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  }
}

export class TalkingHeadStudio {
  constructor(ctx, config = {}) {
    this.ctx = ctx
    const directory = config.directory
    if (!directory) throw new Error('网感口播缺少存储目录配置')
    this.store = new StudioStore(directory, config)
    const hub = () => { try { return ctx.get?.('mediaProviders') } catch { return undefined } }
    this.imageSettings = new ImageSettings(hub)
    this.images = new ImageAssets(this.store, this.imageSettings, { hub })
    ctx.inject?.(['mediaProviders'], inner => {
      inner.effect?.(() => inner.mediaProviders.registerConsumer({ id: 'hypit-workbench', label: '视频工作台 · 网感口播', kinds: ['image'] }))
    })
    this.bindings = new ClipBindings(this.store)
    this.uploads = new VideoUploads(directory, this.store)
    ctx.effect?.(() => async () => {
      await this.uploads.dispose()
      await this.store.dispose()
    })
    ctx.inject?.(['skills'], inner => inner.skills.registerProvider(() => skillProvider()))
  }

  async init() {
    await mkdir(this.store.directory, { recursive: true })
  }

  /** Agent tool, registered on each panel agent bound to a clip. */
  tool() {
    return defineTool({
      name: TOOL_NAME,
      description: '网感口播完整制作入口。先调用 {"op":"context"} 读取这条对话绑定的口播与 project.visualPreferences（已选母画风、分支、组件和编排，必须继承），再用 read_skill 读取 skills/talking-head-video/SKILL.md 和所需引用。request 是 JSON 字符串，op 支持 context/list/get/read_skill/read_file/write_file/studio/doctor/status/job/cancel/adopt/render/edit/transcript/transcribe/catalog/styles/art_style/image_settings/images_list/generate_images/image_use。生图先阅读 context.imageGuide，接口和密钥只由用户在「设置 → 接口与密钥」中修改。projectId 可省略。所有写入和异步任务在请求顶层传 revision（context.project.revision）和 operationId（1–100 位字母数字或短横线，重试保持同一 ID）。例如 {"op":"studio","command":"init","revision":2,"operationId":"init-1","options":{"recipe":"geometry","orchestration":"auto"}}。写文件使用 relative 和 content。用户引用的原句与时间是修改范围；检查或咨询不要启动制作。异步任务返回 jobId，查询到终态；studio run 完成后 adopt 登记成片。',
      parameters: { request: { type: 'string', required: true, description: 'JSON 请求，含 op 和对应参数' } },
      output: { schema: { type: 'string' }, render: (_args, value) => [{ type: 'text', text: value }] },
      execute: async ({ request }, exec) => {
        let input
        try { input = JSON.parse(request) } catch { return JSON.stringify({ error: 'request 不是合法 JSON' }) }
        try {
          return JSON.stringify(await this.executeTool(input, exec))
        } catch (error) {
          return JSON.stringify({ error: error?.message ?? String(error) })
        }
      },
    })
  }

  async executeTool(input, exec) {
    if (['image_settings_save', 'image_settings_import', 'import', 'upload_begin', 'upload_chunk', 'upload_finish', 'bind'].includes(input?.op)) {
      throw new Error('这个操作只能在工作台界面里完成（导入视频、生图密钥不经过对话）。')
    }
    const sessionId = exec?.agent?.session?.id
    const resolved = await resolveClipRequest(input, sessionId, this.bindings)
    if (resolved.context) {
      const { project, selection } = resolved.context
      return { project, selection, job: await this.store.latestJob(project.id), ...await this.imageContext(project) }
    }
    return this.dispatch(resolved.input, exec?.signal)
  }

  async imageContext(project) {
    try {
      const [settings, assets] = await Promise.all([this.imageSettings.view(), this.images.list(project.id)])
      return { imageSettings: settings, imageAssets: assets.assets, imageRequestedCount: assets.requestedCount, imageGuide: IMAGE_GUIDANCE }
    } catch {
      return { imageAssets: [], imageError: '素材设置或索引读取失败；生图配置请在「设置 → 接口与密钥」检查', imageGuide: IMAGE_GUIDANCE }
    }
  }

  /** Environment probe for the panel: no network, fast. */
  async environment() {
    const ffmpeg = executable('ffmpeg')
    const python = this.store.python
    const check = async (command, args) => {
      try { return (await run(command, args, { timeout: 15000 })).trim().split('\n')[0].slice(0, 120) } catch (error) { return null }
    }
    const [ff, py, asr] = await Promise.all([
      check(ffmpeg, ['-hide_banner', '-version']),
      check(python, ['-c', 'import faster_whisper,sys;print(sys.version.split()[0], faster_whisper.__version__)']),
      check(python, [path.join(path.dirname(new URL(import.meta.url).pathname), 'transcribe.py'), '--self-test']),
    ])
    return {
      ffmpeg: { ok: Boolean(ff), detail: ff },
      python: { ok: Boolean(py), detail: py },
      asr: { ok: Boolean(asr && asr.includes('"ok": true')), detail: asr ? 'faster-whisper 本地模型可用' : '未找到本地 small/base 模型，识别文稿会失败' },
    }
  }

  /** Panel ops. `op` here is the original 网感口播 op name. */
  async dispatch(input, signal) {
    signal?.throwIfAborted?.()
    const store = this.store
    const op = input?.op
    if (op === 'environment') return this.environment()
    if (op === 'films') {
      const project = await store.get(input.projectId)
      const root = store.root(project.id)
      const films = await Promise.all([...project.versions].reverse().map(version => filmDetail(root, version)))
      return { films }
    }
    if (op === 'film_image') {
      const project = await store.get(input.projectId)
      const version = project.versions.find(item => item.id === input.versionId)
      if (!version) throw new Error('成片版本不存在')
      const file = await filmImagePath(store.root(project.id), version, input.which)
      const bytes = await readFile(file).catch(() => null)
      if (!bytes) throw new Error('这个版本还没有' + (input.which === 'poster' ? '封面' : '缩略图'))
      if (bytes.length > 8 * 1024 * 1024) throw new Error('图片超过读取上限')
      return { source: 'data:image/jpeg;base64,' + bytes.toString('base64') }
    }
    if (op === 'upload_begin') return this.uploads.begin(input)
    if (op === 'upload_chunk') return this.uploads.chunk(input)
    if (op === 'upload_finish') return this.uploads.finish(input, signal)
    if (op === 'upload_cancel') return this.uploads.cancel(input.uploadId)
    if (op === 'list') return { projects: (await store.list()).map(clipSummary) }
    if (op === 'image_settings') return { settings: await this.imageSettings.view() }
    if (op === 'image_settings_save' || op === 'image_settings_import') throw new Error('生图接口和密钥已统一到「设置 → 接口与密钥」，请在那里修改。')
    if (op === 'images_list') return this.images.list(input.projectId)
    if (op === 'generate_images') return this.images.generate(input)
    if (op === 'image_preview') return this.images.preview(input, signal)
    if (op === 'image_media') return this.images.media(input, signal)
    if (op === 'image_use') return this.images.use(input)
    if (op === 'status') return { project: await store.get(input.projectId), job: await store.latestJob(input.projectId) }
    if (op === 'styles') return { styles: artStyles, branches: artStyleBranches, components: artStyleComponents, orchestrations: artStyleOrchestrations }
    if (op === 'style_preview') {
      const style = artStyle(input.styleId)
      if (!style) throw new Error('自动推荐没有固定参考图')
      const preview = await readFile(path.join(SKILL_ROOT, style.preview))
      if (preview.length > 1024 * 1024) throw new Error('参考图超过读取上限')
      return { source: 'data:image/jpeg;base64,' + preview.toString('base64') }
    }
    if (op === 'art_style') {
      const preferences = visualPreferences(input)
      return store.update(input, project => { project.visualPreferences = preferences })
    }
    if (op === 'import') return store.import(input, signal)
    if (op === 'rename') return store.update(input, project => {
      const name = String(input.name ?? '').trim()
      if (!name || name.length > 160) throw new Error('名字需要 1–160 个字')
      project.name = name
    })
    if (op === 'catalog') return {
      production: JSON.parse(await readFile(path.join(SKILL_ROOT, 'registry/production-catalog.json'), 'utf8')),
      axes: JSON.parse(await readFile(path.join(SKILL_ROOT, 'registry/axes.json'), 'utf8')),
      entry: path.join(SKILL_ROOT, 'skills/talking-head-video/SKILL.md'),
    }
    if (op === 'read_skill') return skillFile(input.relative)
    if (op === 'doctor') return { output: await this.command(['doctor'], signal) }
    if (op === 'get') return { project: await store.get(input.projectId) }
    if (op === 'media') return store.media(input, signal)
    if (op === 'job') return store.job(input)
    if (op === 'cancel') {
      const { job } = await store.job(input)
      if (job.status === 'running') store.jobs.get(job.id)?.controller.abort()
      return store.job(input)
    }
    if (op === 'edit') return store.edit(input)
    if (op === 'transcript') return store.update(input, project => {
      project.transcript = validateTranscript(input.transcript, project.duration)
      project.deleted = []
    })
    if (op === 'render') return store.start(input, (project, jobSignal, log) => store.render(project, jobSignal, log))
    if (op === 'transcribe') return store.start(input, (project, jobSignal, log) => store.transcribe(project, jobSignal, log))
    if (op === 'read_file') {
      await store.get(input.projectId)
      const file = await store.projectPath(input.projectId, input.relative)
      if ((await stat(file)).size > 1024 * 1024) throw new Error('文件超过读取上限')
      return { content: await readFile(file, 'utf8'), path: file }
    }
    if (op === 'write_file') return store.update(input, async project => {
      if (typeof input.content !== 'string' || Buffer.byteLength(input.content) > 2 * 1024 * 1024) throw new Error('文本文件超过写入上限')
      const relative = String(input.relative)
      const activeDirectory = project.creativeDirectory ?? 'creative'
      if (!relative.startsWith(activeDirectory + '/')) throw new Error('制作文件需写入当前工程的 ' + activeDirectory + '/ 子目录')
      const file = await store.projectPath(project.id, relative, true)
      await writeFile(file, input.content)
    })
    if (op === 'studio') return this.studio(input, signal)
    if (op === 'adopt') return store.update(input, async project => {
      const original = await store.projectPath(project.id, (project.creativeDirectory ?? 'creative') + '/outputs/final.mp4')
      const info = await store.probe(original, signal)
      if (info.hasAudio !== project.hasAudio) throw new Error('成片原声轨道缺失')
      const id = randomUUID()
      await copyFile(original, path.join(store.root(project.id), 'outputs', id + '.mp4'))
      project.versions.push({ id, duration: info.duration, label: String(input.label || '创作版本 ' + (project.versions.length + 1)).slice(0, 100), revision: project.revision, createdAt: new Date().toISOString(), creativeDirectory: project.creativeDirectory ?? 'creative' })
    })
    throw new Error('未知的网感口播请求：' + op)
  }

  async studio(input, signal) {
    const store = this.store
    if (readOnlyCommands.has(input.command)) {
      const options = await optionsArgs(input.options, input.projectId ? relative => store.projectPath(input.projectId, relative) : null)
      return { output: await this.command([input.command, ...options], signal) }
    }
    if (!projectCommands.has(input.command)) throw new Error('不支持的制作命令')
    if (input.options && 'orchestration' in input.options) {
      input = { ...input, options: { ...input.options, orchestration: normalizeOrchestration(input.options.orchestration) } }
    }
    if (input.command === 'init') {
      const current = await store.get(input.projectId)
      const active = current.creativeDirectory ?? 'creative'
      const exists = await stat(path.join(store.root(current.id), active, 'project.json')).then(() => true, () => false)
      if (exists) {
        throw new Error(`这条口播已经有一个创作工程（${active}/），init 不会覆盖它。换画风或重做整片请用 {"op":"studio","command":"revise","options":{"request":"改成…的要求"}}：它会在新目录里另起一版，旧版本和成片都保留。不要手动移动或删除 creative 目录。`)
      }
    }
    return store.start(input, async (project, jobSignal, log) => {
      const activeDirectory = project.creativeDirectory ?? 'creative'
      const targetDirectory = input.command === 'revise' ? 'creative-' + randomUUID() : activeDirectory
      const args = [input.command]
      if (input.command === 'revise') args.push('--from', path.join(store.root(project.id), activeDirectory), '--out', path.join(store.root(project.id), targetDirectory))
      else args.push('--project', path.join(store.root(project.id), activeDirectory))
      args.push(...await optionsArgs(input.options, relative => store.projectPath(project.id, relative)))
      if (input.command === 'init') {
        args.push('--source', path.join(store.root(project.id), 'assets/master.mp4'))
        if (project.transcript.length) {
          const srt = project.transcript.map((line, index) => `${index + 1}\n${srtTime(line.start)} --> ${srtTime(line.end)}\n${line.text}\n`).join('\n')
          const transcript = path.join(store.root(project.id), 'assets/canonical.srt')
          await writeFile(transcript, srt)
          args.push('--transcript', transcript)
        }
      }
      if (!['init', 'revise'].includes(input.command)) await this.images.attach(project)
      try {
        log(await this.command(args, jobSignal, log))
      } catch (error) {
        // Surface the real quality-gate reasons instead of "查看qa/check.log".
        if (/check失败|查看qa\/check\.log/u.test(String(error?.message))) {
          const summary = await summarizeCheck(path.join(store.root(project.id), activeDirectory))
          if (summary) throw new Error(`${summary}按 qa/check.log 的 fixHint 改 index.html 或生成脚本后重跑 run。`)
        }
        throw error
      }
      if (input.command === 'revise') {
        project.creativeDirectory = targetDirectory
        project.revision += 1
        project.updatedAt = new Date().toISOString()
        await atomic(store.file(project.id), project)
      }
      if (['init', 'revise'].includes(input.command)) await this.images.attach(project)
    })
  }

  command(args, signal, onLine) {
    return run(this.store.node, [path.join(SKILL_ROOT, 'scripts/studio.mjs'), ...args], {
      signal, onLine, cwd: SKILL_ROOT,
      env: { WG_PYTHON: this.store.python, PATH: [path.dirname(executable('ffmpeg')), process.env.PATH].join(path.delimiter) },
    })
  }

  /** Short brief injected into the panel agent of a talking-head clip. */
  guide(project) {
    const summary = clipSummary(project)
    return [
      '# 网感口播',
      `这条对话绑定口播「${summary.name}」（${summary.duration.toFixed(1)} 秒，${summary.lines} 句，已删 ${project.deleted.length} 句，${summary.versions} 个版本）。`,
      '- 一切操作走 wanggan_studio 工具；先 {"op":"context"}，制作前先 read_skill 读 skills/talking-head-video/SKILL.md。',
      '- 用户引用的原句是修改范围；只咨询时不要启动 init/run。',
      '- 删句用 edit(cut/restore) 再 render 出剪辑版本；创作整片走 studio init → 设计 → run → adopt。',
      '- 已经做过整片、要换画风或重做时，用 studio revise（新目录另起一版），不要再 init，也不要用 bash 移动、删除 creative 目录。',
      `- orchestration 只能用：auto、${orchestrationIds().join('、')}。不确定就用 auto。`,
      '- 写 scene-plan.json 前先读本片 recipe.json 的 selections.information，每个场景的 relation 只能从里面选；字幕和标签只用常规汉字与标点，不用 ✓✗★ 等符号（字体可能不含）。',
      '- studio run 失败时先读 qa/check.log 里 severity 为 error 的条目，按 fixHint 修改后再跑，不要原样重试。',
      '- 导入视频、生图密钥只能在工作台界面完成，不要在对话里索要。',
    ].join('\n')
  }
}
