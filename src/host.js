import { createUserMessage } from '@deepseek-ai/dsh-llm'
import { Service } from '@deepseek-ai/cordis'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import { randomUUID } from 'node:crypto'
import { basename, join, resolve as resolvePath, sep } from 'node:path'
import { SERVICE } from './typert.js'
import { buildPlan, buildTask } from './prompt.js'
import { createHypitTools, createPanelQuestionTool } from './tools.js'
import { TalkingHeadStudio, clipSummary, TOOL_NAME as CLIP_TOOL } from './talking-head/studio.js'
import { buildVideoPath, listBuilds, readChunk } from './hypit-films.js'
import { executable as findBinary, run as runProcess } from './talking-head/process.js'
import { grantAccess, normalizeAnswers, panelGuide, summarizeEvents } from './session-access.js'
import { ChatHistory, titleFrom } from './chat-history.js'
import {
  LIMITS,
  detectExecutor,
  detectSkill,
  discoverProjects,
  createProject,
  ensureRoot,
  nodeStatus,
  readProjectDetail,
  readSource,
  runHypit,
  validateCommandSource,
} from './store.js'

let markRequest

const EXECUTOR_TTL_MS = 60_000
const MAX_BACKFILL = 20

function publicError(error) {
  const code = typeof error?.code === 'string' ? error.code : 'unavailable'
  const message = typeof error?.message === 'string' && error.message.trim()
    ? error.message
    : 'Hypit 工作台暂时无法完成这项操作，请稍后重试。'
  return { code, message }
}

function configuredRoots(config) {
  const raw = config?.roots ?? config?.directory
  const list = Array.isArray(raw) ? raw : typeof raw === 'string' ? [raw] : []
  return list.filter(item => typeof item === 'string' && item.trim()).slice(0, LIMITS.roots)
}

class HypitWorkbench extends TypertRemoteService {
  static inject = ['sessions', 'agents', 'agentDefaultModel', 'llm', 'sessionPersistence']

  constructor(ctx, config) {
    super(ctx, SERVICE)
    markRequest.call(this)
    this.roots = configuredRoots(config)
    this.allowed = new Set()
    this.executorCache = { at: 0, key: '', value: null }
    this.chats = new Map()
    this.history = new ChatHistory()
    this.toolNames = createHypitTools(this.roots).map(tool => tool.name)
    this.installTools()
    this.clips = null
    try {
      this.clips = new TalkingHeadStudio(ctx, { directory: config?.talkingHead?.directory ?? config?.clipDirectory, node: config?.node, python: config?.python })
    } catch (error) {
      ctx?.logger?.warn?.('video-workbench: 网感口播未启用 (%s)', error?.message ?? error)
    }
  }

  async [Service.init]() {
    await this.clips?.init()
  }

  /**
   * Tools live on the agent that runs a conversation, not on the plugin scope:
   * register them for every existing agent and for each one created later.
   */
  installTools() {
    const root = this.ctx
    if (!root?.inject) {
      this.toolsMounted = false
      return
    }
    const done = new WeakSet()
    const register = agent => {
      if (!agent?.ctx?.tools?.register || done.has(agent)) return
      done.add(agent)
      try {
        for (const tool of createHypitTools(this.roots)) agent.ctx.tools.register(tool)
        this.toolsMounted = true
      } catch (error) {
        root.logger?.warn?.('hypit-workbench: agent tool registration failed (%s)', error?.message ?? error)
      }
    }
    this.toolsMounted = false
    root.inject(['tools', 'agents'], scope => {
      for (const agent of scope.agents.list()) register(agent)
      scope.on('agent/created', ({ agent }) => register(agent))
      this.toolsMounted = scope.agents.list().length > 0
    })
  }

  async request(input, signal = AbortSignal.timeout(60_000)) {
    const principal = this.ctx?.invocation?.peer?.principal
    if (principal && principal.kind !== 'owner') {
      return { error: { code: 'forbidden', message: '仅当前应用所有者可以查看本地视频项目。' } }
    }
    try {
      return await this.dispatch(input, signal)
    } catch (error) {
      if (signal?.aborted) return { error: { code: 'aborted', message: '这次读取已取消。' } }
      return { error: publicError(error) }
    }
  }

  async dispatch(input, signal) {
    signal?.throwIfAborted()
    if (!input || typeof input !== 'object' || Array.isArray(input) || typeof input.op !== 'string') {
      return { error: { code: 'invalid-request', message: '这项操作无法识别。' } }
    }
    if (input.op === 'overview') return await this.overview(input, signal)
    if (input.op.startsWith('th_')) return await this.clipOp(input, signal)
    if (input.op === 'builds') {
      const root = await this.requireProject(input?.path, signal)
      const builds = await listBuilds(root)
      return { builds: builds.map(({ dir, ...rest }) => rest) }
    }
    if (input.op === 'build-media') {
      const root = await this.requireProject(input?.path, signal)
      const { file, mediaType } = await buildVideoPath(root, input.buildId, input.which)
      return await readChunk(file, input.offset ?? 0, mediaType)
    }
    if (input.op === 'film-poster') {
      const root = await this.requireProject(input?.path, signal)
      const file = input.buildId ? (await buildVideoPath(root, input.buildId)).file : this.projectVideo(root, input.rel)
      return { source: await this.posterFor(file, signal) }
    }
    if (input.op === 'result-media') {
      const root = await this.requireProject(input?.path, signal)
      const file = this.projectVideo(root, input.rel)
      return await readChunk(file, input.offset ?? 0, /\.webm$/iu.test(file) ? 'video/webm' : 'video/mp4')
    }
    if (input.op === 'models-debug') return await this.debugModelDump()
    if (input.op === 'models') return await this.models()
    if (input.op === 'project') return await this.project(input, signal)
    if (input.op === 'source') return await this.source(input, signal)
    if (input.op === 'compose') return await this.compose(input, signal)
    if (input.op === 'check') return await this.check(input, signal)
    if (input.op === 'plan') return await this.plan(input, signal)
    if (input.op === 'chat') return await this.chat(input, signal)
    if (input.op === 'chat-reset') return await this.chatReset(input, signal)
    if (input.op === 'chat-list') return await this.chatList(input, signal)
    if (input.op === 'chat-open') return await this.chatOpen(input, signal)
    if (input.op === 'chat-delete') return await this.chatDelete(input, signal)
    if (input.op === 'chat-poll') return await this.chatPoll(input, signal)
    if (input.op === 'chat-answer') return await this.chatAnswer(input, signal)
    if (input.op === 'chat-stop') return await this.chatStop(input, signal)
    if (input.op === 'create') return await this.create(input, signal)
    return { error: { code: 'invalid-request', message: '这项操作无法识别。' } }
  }

  async models() {
    const selection = (() => { try { return this.ctx.agentDefaultModel.currentSelection() } catch { return null } })()
    let providers = []
    try { providers = (await this.ctx.llm.listProviders()) ?? [] } catch {}
    const catalog = []
    for (const provider of providers) {
      const id = provider.id ?? provider.name
      let models = []
      try { models = (await this.ctx.llm.listModels(id)) ?? [] } catch {}
      catalog.push({ id, name: provider.name ?? id, models: models.map(model => ({
        id: model.model ?? model.id ?? model.name,
        label: model.label ?? model.name ?? model.model ?? model.id,
        efforts: model.reasoningEfforts ?? model.reasoningEffortOptions ?? [],
        defaultEffort: model.defaultReasoningEffort ?? null,
      })) })
    }
    return { selection, providers: catalog, current: selection }
  }

  async debugModelDump() {
    const names = object => {
      if (!object || (typeof object !== 'object' && typeof object !== 'function')) return null
      const own = Object.getOwnPropertyNames(Object.getPrototypeOf(object) ?? {}).filter(name => name !== 'constructor')
      return [...new Set([...own, ...Object.keys(object)])].slice(0, 40)
    }
    const ctx = this.ctx
    const report = { selection: null, services: {} }
    try { report.selection = ctx.agentDefaultModel.currentSelection() } catch (reason) { report.selection = String(reason) }
    try { report.config = ctx.agentDefaultModel.config } catch (reason) { report.config = String(reason) }
    try {
      const llm = ctx.llm
      report.providers = await llm.listProviders()
      report.configurable = await llm.listConfigurableProviders?.()
      for (const provider of report.providers ?? []) {
        const id = provider.id ?? provider.name
        try { await llm.discoverModels?.(id) } catch {}
        try { report['models:' + id] = await llm.listModels(id) } catch (reason) { report['models:' + id] = 'ERR ' + String(reason).slice(0, 160) }
      }
      try { report.info = await llm.resolveModelInfo?.({ provider: 'deepseek-official', model: 'deepseek-flash' }) } catch (reason) { report.info = 'ERR ' + String(reason).slice(0, 160) }
      report.llmCalls = {}
      for (const method of ['list', 'listModels', 'models', 'providers', 'catalog', 'available', 'options']) {
        if (typeof llm?.[method] !== 'function') { report.llmCalls[method] = 'n/a'; continue }
        try {
          const value = await llm[method]()
          report.llmCalls[method] = JSON.parse(JSON.stringify(value)).slice?.(0, 20) ?? value
        } catch (reason) { report.llmCalls[method] = 'ERR ' + String(reason).slice(0, 120) }
      }
    } catch (reason) { report.llmError = String(reason) }
    for (const name of ['agentDefaultModel', 'llm', 'models', 'providers', 'agents', 'sessions']) {
      try { report.services[name] = names(ctx[name]) } catch (reason) { report.services[name] = String(reason) }
    }
    try {
      const { writeFileSync } = await import('node:fs')
      writeFileSync('/tmp/hw-model-dump.json', JSON.stringify(report, null, 2))
    } catch {}
    return report
  }

  async overview(input, signal) {
    const requested = Array.isArray(input?.roots)
      ? input.roots.filter(item => typeof item === 'string' && item.trim()).slice(0, LIMITS.roots)
      : []
    const raw = requested.length ? requested : this.roots
    const roots = []
    const problems = []
    const projectRoots = []

    for (const item of raw) {
      signal?.throwIfAborted()
      const checked = await ensureRoot(item)
      if (!checked.ok) {
        roots.push({
          path: checked.path || String(item),
          ok: false,
          created: false,
          error: checked.error,
          projects: [],
          truncated: false,
        })
        problems.push({ root: checked.path || String(item), message: checked.error })
        continue
      }
      this.scannedRoots ??= new Set()
      this.scannedRoots.add(checked.path)
      const found = await discoverProjects(checked.path)
      for (const project of found.projects) {
        this.allowed.add(project.root)
        projectRoots.push(project.root)
      }
      for (const problem of found.problems) problems.push(problem)
      roots.push({
        path: checked.path,
        ok: true,
        created: checked.created === true,
        error: '',
        projects: found.projects,
        truncated: found.truncated,
      })
    }

    const key = projectRoots.slice().sort().join('\n')
    let executor = this.executorCache.value
    if (!executor || this.executorCache.key !== key || Date.now() - this.executorCache.at > EXECUTOR_TTL_MS) {
      executor = await detectExecutor(projectRoots)
      this.executorCache = { at: Date.now(), key, value: executor }
    }

    return {
      sampledAt: new Date().toISOString(),
      roots,
      problems,
      executor,
      tools: this.toolNames,
      toolsMounted: this.toolsMounted === true,
      skill: await detectSkill(),
      node: nodeStatus(),
      configured: this.roots,
    }
  }

  async create(input, signal) {
    signal?.throwIfAborted()
    const root = typeof input?.root === 'string' ? input.root : ''
    if (!this.scannedRoots?.has(root)) {
      throw Object.assign(new Error('只能在已扫描的根目录里新建项目，请先扫描。'), { code: 'invalid-root' })
    }
    const made = await createProject(root, input?.name, input?.brief)
    this.allowed.add(made.root)
    return made
  }

  /** Panel ops for 网感口播: `th_<op>` maps to the studio op `<op>`. */
  async clipOp(input, signal) {
    if (!this.clips) throw Object.assign(new Error('网感口播没有启用。'), { code: 'unavailable' })
    const op = input.op.slice(3)
    const allowed = new Set(['environment', 'films', 'film_image', 'list', 'get', 'status', 'media', 'job', 'cancel', 'edit', 'render', 'transcribe', 'transcript', 'rename',
      'upload_begin', 'upload_chunk', 'upload_finish', 'upload_cancel', 'import',
      'styles', 'style_preview', 'art_style',
      'image_settings', 'image_settings_save', 'image_settings_import', 'images_list', 'generate_images', 'image_preview', 'image_media', 'image_use'])
    if (!allowed.has(op)) throw Object.assign(new Error('这项口播操作无法识别。'), { code: 'invalid-request' })
    const result = await this.clips.dispatch({ ...input, op }, signal)
    if (op === 'get' || op === 'status') return { ...result, summary: result.project ? clipSummary(result.project) : null }
    return result
  }

  projectVideo(root, raw) {
    const rel = String(raw ?? '')
    const file = resolvePath(root, rel)
    if (!rel || rel.includes('\\') || !file.startsWith(root + sep) || !/\.(mp4|mov|webm|m4v)$/iu.test(rel)) {
      throw Object.assign(new Error('只能读取项目里的视频文件。'), { code: 'invalid-source' })
    }
    return file
  }

  /** A cover frame (JPEG data URL), grabbed once per file version with ffmpeg. */
  async posterFor(file, signal) {
    const info = await import('node:fs/promises').then(fs => fs.stat(file))
    const key = `${file}:${info.size}:${info.mtimeMs}`
    this.posters ??= new Map()
    if (this.posters.has(key)) return this.posters.get(key)
    const { mkdtemp, readFile: read, rm } = await import('node:fs/promises')
    const { tmpdir } = await import('node:os')
    const dir = await mkdtemp(join(tmpdir(), 'vw-poster-'))
    try {
      const out = join(dir, 'poster.jpg')
      const ffmpeg = findBinary('ffmpeg')
      // Skip a black first frame: try ~30% in, fall back to the first frame.
      for (const at of ['0.3', '0']) {
        try {
          await runProcess(ffmpeg, ['-nostdin', '-v', 'error', '-y', '-ss', at === '0' ? '0' : String(Math.max(0.5, Math.min(4, (await this.duration(file)) * 0.3))), '-i', file, '-frames:v', '1', '-vf', 'scale=540:-2', '-q:v', '4', out], { signal, timeout: 20000 })
          const bytes = await read(out)
          if (bytes.length > 1500) {
            const source = 'data:image/jpeg;base64,' + bytes.toString('base64')
            if (this.posters.size > 60) this.posters.clear()
            this.posters.set(key, source)
            return source
          }
        } catch {}
      }
      throw Object.assign(new Error('取不到封面画面。'), { code: 'unavailable' })
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  }

  async duration(file) {
    try {
      const out = await runProcess(findBinary('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { timeout: 10000 })
      const value = Number(out.trim())
      return Number.isFinite(value) ? value : 3
    } catch { return 3 }
  }

  async requireProject(path, signal) {
    const id = typeof path === 'string' ? path.trim() : ''
    if (!id) throw Object.assign(new Error('还没有选择视频项目。'), { code: 'unknown-project' })
    if (!this.allowed.has(id)) {
      throw Object.assign(new Error('这个项目不在最近一次扫描结果里，请先刷新项目列表。'), { code: 'unknown-project' })
    }
    signal?.throwIfAborted()
    return id
  }

  async project(input, signal) {
    const root = await this.requireProject(input?.path, signal)
    const detail = await readProjectDetail(root)
    const builds = await listBuilds(root).catch(() => [])
    const sizes = new Set(builds.map(build => build.video.bytes))
    const exports = (detail.results ?? []).filter(item => /\.(mp4|mov|webm|m4v)$/iu.test(item.rel) && !sizes.has(item.bytes))
    const films = builds.length + exports.length
    return { ...detail, builds: builds.length, films, counts: { ...detail.counts, result: films || detail.counts?.result || 0 } }
  }

  async source(input, signal) {
    const root = await this.requireProject(input?.path, signal)
    return await readSource(root, input?.rel)
  }

  async executorFor(signal, root) {
    signal?.throwIfAborted()
    const cached = this.executorCache.value
    if (cached?.found && cached.path && !cached.error) return cached
    const fresh = await detectExecutor(root ? [root] : [])
    this.executorCache = { at: Date.now(), key: root ?? '', value: fresh }
    if (!fresh.found || !fresh.path) {
      throw Object.assign(
        new Error('没找到 hypit 执行器。先安装：npm install --global @hypit/hypit --registry=https://registry.npmjs.org'),
        { code: 'executor-missing' },
      )
    }
    return fresh
  }

  async command(input, signal, mode) {
    const root = await this.requireProject(input?.path, signal)
    const rel = validateCommandSource(input?.rel, mode)
    const executor = await this.executorFor(signal, root)
    const args = mode === 'check' ? ['check', rel] : ['plan', rel]
    const result = await runHypit(executor.path, args, { cwd: root })
    return { ...result, mode, rel, command: `hypit ${args.join(' ')}` }
  }

  async check(input, signal) {
    return await this.command(input, signal, 'check')
  }

  async plan(input, signal) {
    return await this.command(input, signal, 'plan')
  }

  /**
   * The panel's own conversation: a private agent bound to a subagent session,
   * so nothing is added to the user's workspace or session list. Turns run in
   * the background; the panel polls `chat-poll` for progress.
   */
  /**
   * A chat target is either a scanned Hypit project (`path`) or a 网感口播
   * clip (`clip`). Returns { key, cwd, kind, project? }.
   */
  async resolveTarget(input, signal) {
    if (input?.clip) {
      if (!this.clips) throw Object.assign(new Error('网感口播没有启用。'), { code: 'unavailable' })
      const project = await this.clips.store.get(String(input.clip)).catch(() => null)
      if (!project) throw Object.assign(new Error('这条口播不存在或已被删除。'), { code: 'unknown-project' })
      const cwd = this.clips.store.root(project.id)
      return { key: 'clip:' + project.id, cwd, kind: 'clip', project }
    }
    const root = await this.requireProject(input?.path, signal)
    return { key: root, cwd: root, kind: 'hypit' }
  }

  /**
   * The live conversation for a target. With `sessionId`, reopen that past
   * conversation (host session restored from disk); otherwise reuse the live
   * one, else reopen the most recent one, else start fresh. `fresh: true`
   * always starts a new conversation.
   */
  async chatFor(target, selection = {}, signal, { sessionId: wanted, fresh = false } = {}) {
    const root = target.key
    const active = this.ctx?.agentDefaultModel?.currentSelection?.() ?? {}
    const chosen = {
      provider: selection.provider || active.provider,
      model: selection.model || active.model,
      reasoningEffort: selection.reasoningEffort || undefined,
      access: selection.access === 'workspace' ? 'workspace' : 'full',
    }
    if (!chosen.provider || !chosen.model) {
      throw Object.assign(new Error('还没有可用的模型。打开「设置 → 模型」选一个默认模型再对话。'), { code: 'no-model' })
    }
    const key = `${chosen.provider}::${chosen.model}::${chosen.reasoningEffort ?? ''}::${chosen.access}`
    const existing = this.chats.get(root)
    if (existing) {
      const sameSession = !wanted || wanted === existing.sessionId
      if (!fresh && sameSession && existing.key === key) return existing
      if (existing.running) throw Object.assign(new Error('上一句还在跑，等它回完或先停止，再换对话、模型或权限。'), { code: 'chat-busy' })
      await this.disposeChat(root)
    }
    signal?.throwIfAborted()
    // Model/access changes keep the same conversation: the transcript is on disk.
    let resumeId = fresh ? '' : wanted || existing?.sessionId || ''
    if (!resumeId && !fresh) resumeId = (await this.history.latest(root))?.sessionId ?? ''
    if (resumeId) {
      try {
        return await this.openChat(target, chosen, key, resumeId)
      } catch (error) {
        this.ctx.logger?.warn?.('video-workbench: could not reopen %s (%s)', resumeId, error?.message ?? error)
        if (wanted) throw Object.assign(new Error('这段对话没能打开：' + (error?.message || '会话文件不可用')), { code: 'resume-failed' })
      }
    }
    return await this.openChat(target, chosen, key, '')
  }

  /** Build the panel agent on a new session, or resume `resumeId` from disk. */
  async openChat(target, chosen, key, resumeId) {
    const root = target.key
    const cwd = target.cwd
    const tools = target.kind === 'clip' ? [this.clips.tool()] : createHypitTools([cwd])
    // Mount the host's default agent preset so the panel agent gets the same
    // file / bash / edit tools as a normal conversation, not just our three.
    const presets = this.ctx.get?.('agentPresets')
    let presetId
    try { presetId = presets ? (await presets.resolve()).id : undefined } catch { presetId = undefined }
    const chat = { key, sessionId: resumeId, access: chosen.access, running: false, question: null, provider: chosen.provider, model: chosen.model }
    const setup = async agentCtx => {
      if (presetId) await presets.mount(agentCtx, presetId)
      for (const tool of tools) {
        try { agentCtx.tools.register(tool) } catch {}
      }
      try {
        agentCtx.systemPrompt?.context?.({
          name: 'video-workbench:panel',
          order: 205,
          text: () => target.kind === 'clip' ? panelGuide(cwd, 'clip') + '\n\n' + this.clips.guide(target.project) : panelGuide(cwd),
        })
      } catch {}
      // The host treats this private agent as delegated, so its built-in
      // ask_user_question refuses. Give it a panel-backed question tool.
      try { agentCtx.tools.restrict({ deny: ['ask_user_question'] }) } catch {}
      try {
        agentCtx.tools.register(createPanelQuestionTool(chat))
      } catch (error) {
        this.ctx.logger?.warn?.('video-workbench: ask_user unavailable (%s)', error?.message ?? error)
      }
    }
    const agentOptions = {
      provider: chosen.provider,
      model: chosen.model,
      ...(chosen.reasoningEffort ? { reasoningEffort: chosen.reasoningEffort } : {}),
    }
    let handle
    if (resumeId) {
      handle = await this.ctx.agents.resume({ resumeSessionId: resumeId, agentOptions, setup })
    } else {
      // agents.create persists the session through the host's session store.
      const sessionId = `session-${randomUUID()}`
      chat.sessionId = sessionId
      handle = await this.ctx.agents.create({
        sessionId,
        meta: { cwd, origin: 'subagent', ...(presetId ? { agentPreset: presetId } : {}) },
        agentOptions,
        setup,
      })
    }
    chat.handle = handle
    chat.agent = handle.agent
    chat.sessionId = handle.agent?.session?.id ?? chat.sessionId
    if (target.kind === 'clip') this.clips.bindings.bind(chat.sessionId, target.project.id)
    grantAccess(handle.agent?.session, chosen.access)
    this.chats.set(root, chat)
    if (!resumeId) await this.history.update(root, chat.sessionId, { title: '新对话', turns: 0, provider: chosen.provider, model: chosen.model })
    else await this.history.update(root, chat.sessionId, { provider: chosen.provider, model: chosen.model, updatedAt: (await this.history.get(root, chat.sessionId))?.updatedAt ?? Date.now() })
    return chat
  }

  async disposeChat(root) {
    const chat = this.chats.get(root)
    if (!chat) return
    this.chats.delete(root)
    try { chat.question?.reject(new Error('对话已清空。')) } catch {}
    try { chat.agent?.cancel?.({ kind: 'disposed' }) } catch {}
    try { await chat.handle?.dispose() } catch {}
    this.clips?.bindings.unbind(chat.sessionId)
  }

  async chat(input, signal) {
    const target = await this.resolveTarget(input, signal)
    const message = String(input?.message ?? '').trim().slice(0, 4000)
    if (!message) throw Object.assign(new Error('先说一句要做什么。'), { code: 'empty-message' })
    const selection = {
      provider: input?.provider ? String(input.provider) : undefined,
      model: input?.model ? String(input.model) : undefined,
      reasoningEffort: input?.reasoningEffort ? String(input.reasoningEffort) : undefined,
      access: input?.access === 'workspace' ? 'workspace' : 'full',
    }
    const fresh = this.fresh?.has(target.key) ?? false
    const chat = await this.chatFor(target, selection, signal, { sessionId: typeof input?.sessionId === 'string' ? input.sessionId : '', fresh })
    this.fresh?.delete(target.key)
    if (chat.running) throw Object.assign(new Error('上一句还在跑，等它回完再发，或者先停止。'), { code: 'chat-busy' })
    const known = await this.history.get(target.key, chat.sessionId)
    await this.history.update(target.key, chat.sessionId, {
      title: !known || known.title === '新对话' ? titleFrom(message) : known.title,
      turns: (known?.turns ?? 0) + 1,
      updatedAt: Date.now(),
    })
    const cursor = chat.agent.session.snapshotEvents().length
    chat.running = true
    chat.startedAt = Date.now()
    try {
      await chat.agent.runMaintenance(async activity => {
        activity.throwIfAborted()
        chat.agent.followup(createUserMessage({
          content: [{ type: 'text', text: message }],
          source: { kind: 'user' },
        }))
        if (!(await this.ctx.sessions.flush(chat.agent.session))) throw new Error('这一轮没有写进会话。')
      })
    } catch (error) {
      chat.running = false
      throw error
    }
    chat.agent.whenIdle()
      .catch(() => {})
      .finally(() => { chat.running = false; chat.question = null })
    return { cursor, sessionId: chat.sessionId, running: true }
  }

  async chatPoll(input, signal) {
    const target = await this.resolveTarget(input, signal)
    let chat = this.chats.get(target.key)
    const wanted = typeof input?.sessionId === 'string' ? input.sessionId : ''
    if (chat && wanted && chat.sessionId !== wanted) chat = null
    if (!chat) {
      // Not live: show the transcript straight from disk, without starting an agent.
      const entry = wanted ? await this.history.get(target.key, wanted) : await this.history.latest(target.key)
      if (!entry) return { messages: [], cursor: 0, running: false, question: null, error: '', exists: false, sessionId: '' }
      const events = await this.readSessionEvents(entry.sessionId, signal)
      if (!events) return { messages: [], cursor: 0, running: false, question: null, error: '', exists: false, sessionId: '' }
      const summary = summarizeEvents(events)
      return { messages: summary.messages, error: '', stopped: false, cursor: 0, running: false, startedAt: 0, question: null, model: entry.model, exists: true, sessionId: entry.sessionId, cold: true }
    }
    const events = chat.agent.session.snapshotEvents()
    const raw = Number(input?.cursor)
    const from = Number.isInteger(raw) && raw >= 0 && raw <= events.length ? raw : 0
    const summary = summarizeEvents(events.slice(from))
    return {
      messages: summary.messages,
      error: summary.error,
      stopped: summary.stopped,
      cursor: events.length,
      running: chat.running,
      startedAt: chat.startedAt ?? 0,
      question: chat.question ? { questions: chat.question.questions } : null,
      model: chat.key.split('::')[1] ?? '',
      exists: true,
      sessionId: chat.sessionId,
    }
  }

  /** Read a persisted session's events; null when it is gone. */
  async readSessionEvents(sessionId, signal) {
    const live = this.ctx.sessions?.get?.(sessionId)
    if (live?.snapshotEvents) return live.snapshotEvents()
    const persistence = this.ctx.get?.('sessionPersistence')
    if (!persistence) return null
    let handle
    try {
      handle = await persistence.open(sessionId, 'read', { signal })
      const result = await handle.read(0, Number.MAX_SAFE_INTEGER, { signal })
      return result?.events ?? []
    } catch {
      return null
    } finally {
      try { await handle?.close?.() } catch {}
    }
  }

  /** Conversations for a target, newest first; backfills sessions made before the index existed. */
  async chatList(input, signal) {
    const target = await this.resolveTarget(input, signal)
    await this.backfill(target, signal)
    const live = this.chats.get(target.key)
    const list = await this.history.list(target.key)
    return {
      conversations: list.map(entry => ({ ...entry, live: live?.sessionId === entry.sessionId, running: live?.sessionId === entry.sessionId && live.running })),
      current: live?.sessionId ?? list[0]?.sessionId ?? '',
    }
  }

  /** One-time import of panel sessions already on disk for this target's cwd. */
  async backfill(target, signal) {
    this.backfilled ??= new Set()
    if (this.backfilled.has(target.key)) return
    this.backfilled.add(target.key)
    const persistence = this.ctx.get?.('sessionPersistence')
    if (!persistence?.list) return
    let snapshots = []
    try { snapshots = await persistence.list({ signal }) } catch { return }
    const known = new Set((await this.history.list(target.key)).map(entry => entry.sessionId))
    const mine = snapshots.filter(item => item?.header?.cwd === target.cwd && item.header.origin === 'subagent' && !item.header.parentSession && !known.has(item.header.id))
    for (const item of mine.slice(-MAX_BACKFILL)) {
      const events = await this.readSessionEvents(item.header.id, signal)
      if (!events?.length) continue
      const users = events.filter(event => event?.type === 'user/message' && event.data?.source?.kind === 'user')
      if (!users.length) continue
      const first = summarizeEvents(users).messages[0]?.text ?? ''
      const last = events[events.length - 1]
      await this.history.update(target.key, item.header.id, {
        title: titleFrom(first),
        turns: users.length,
        createdAt: item.header.createdAt ?? events[0]?.time ?? Date.now(),
        updatedAt: last?.time ?? item.header.createdAt ?? Date.now(),
      })
    }
  }

  async chatAnswer(input, signal) {
    const pending = this.chats.get((await this.resolveTarget(input, signal)).key)?.question
    if (!pending) throw Object.assign(new Error('这个问题已经结束了。'), { code: 'no-question' })
    pending.resolve(normalizeAnswers(pending.questions, input?.answers))
    return { ok: true }
  }

  async chatStop(input, signal) {
    const chat = this.chats.get((await this.resolveTarget(input, signal)).key)
    if (!chat?.running) return { ok: true, running: false }
    try { chat.question?.reject(new Error('已停止。')) } catch {}
    chat.agent.cancel({ kind: 'user' })
    return { ok: true }
  }

  /** Start a new conversation; the previous one stays in the history. */
  async chatReset(input, signal) {
    const target = await this.resolveTarget(input, signal)
    const live = this.chats.get(target.key)
    if (live?.running) throw Object.assign(new Error('上一句还在跑，先停止再开新对话。'), { code: 'chat-busy' })
    await this.disposeChat(target.key)
    this.fresh ??= new Set()
    this.fresh.add(target.key)
    return { ok: true }
  }

  /** Switch the live agent to a past conversation. */
  async chatOpen(input, signal) {
    const target = await this.resolveTarget(input, signal)
    const sessionId = String(input?.sessionId ?? '')
    if (!(await this.history.get(target.key, sessionId))) throw Object.assign(new Error('没有这段对话。'), { code: 'unknown-chat' })
    const live = this.chats.get(target.key)
    if (live?.running && live.sessionId !== sessionId) throw Object.assign(new Error('上一句还在跑，先停止再切换对话。'), { code: 'chat-busy' })
    if (live && live.sessionId !== sessionId) await this.disposeChat(target.key)
    this.fresh?.delete(target.key)
    return await this.chatPoll({ ...input, sessionId }, signal)
  }

  async chatDelete(input, signal) {
    const target = await this.resolveTarget(input, signal)
    const sessionId = String(input?.sessionId ?? '')
    const live = this.chats.get(target.key)
    if (live?.sessionId === sessionId) {
      if (live.running) throw Object.assign(new Error('这段对话还在跑，先停止。'), { code: 'chat-busy' })
      await this.disposeChat(target.key)
    }
    // Only the panel's index entry; the host session file stays on disk.
    await this.history.remove(target.key, sessionId)
    return { ok: true }
  }

  async compose(input, signal) {
    let root = ''
    if (input?.path) root = await this.requireProject(input.path, signal)
    if (input?.kind === 'task' || input?.intent) {
      const plan = buildTask({
        project: root,
        label: input?.label,
        intent: input?.intent ?? input?.brief,
        counts: input?.counts,
      })
      return { ...plan, projectRoot: root }
    }
    const plan = buildPlan({
      kind: input?.kind,
      project: root,
      reference: input?.reference,
      brief: input?.brief,
      label: input?.label,
      counts: input?.counts,
    })
    return { ...plan, projectRoot: root }
  }
}

Remote(HypitWorkbench.prototype.request, {
  name: 'request',
  private: false,
  static: false,
  addInitializer(initializer) {
    markRequest = initializer
  },
})

export default HypitWorkbench
