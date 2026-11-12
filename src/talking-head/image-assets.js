import { createHash, randomUUID } from 'node:crypto'
import { readFile, writeFile, mkdir, lstat, realpath, rename, copyFile, open, rm, stat } from 'node:fs/promises'
import path from 'node:path'
import { atomic } from './store.js'
import { executable, run } from './process.js'
import { requestImage } from './image-provider.js'

const hash = value => createHash('sha256').update(value).digest('hex')
const uuid = /^[a-f\d-]{36}$/u
const purposes = ['scene', 'object', 'background', 'texture', 'comparison', 'detail']
const errorText = error => error?.message || '生图失败'
export class ImageAssets {
  constructor(store, settings, { request = requestImage, hub } = {}) {
    this.store = store; this.settings = settings; this.request = request; this.hub = hub; this.previews = new Map(); this.verified = new Map()
  }
  async folder(projectId, relative = 'images') {
    const root = await realpath(this.store.root(projectId))
    let target = root
    for (const part of relative.split('/')) {
      if (!part || part === '.' || part === '..' || part.includes('\\')) throw new Error('无效素材目录')
      target = path.join(target, part)
      try { if ((await lstat(target)).isSymbolicLink()) throw new Error('素材目录不能使用软链接') } catch (error) { if (error.code !== 'ENOENT') throw error }
      await mkdir(target, { recursive: true })
      if (!(await realpath(target)).startsWith(root + path.sep)) throw new Error('素材目录超出当前口播')
    }
    return target
  }
  async catalog(projectId) {
    const folder = await this.folder(projectId)
    try { return JSON.parse(await readFile(path.join(folder, 'catalog.json'), 'utf8')) } catch (error) { if (error.code !== 'ENOENT') throw error }
    return { assets: [] }
  }
  async save(projectId, catalog) { await atomic(path.join(await this.folder(projectId), 'catalog.json'), catalog) }
  async list(projectId) {
    await this.store.get(projectId)
    const catalog = await this.catalog(projectId)
    return { assets: catalog.assets.map(row => ({
      ...row, status: row.status === 'sending' && ![...this.store.jobs.values()].some(job => job.projectId === projectId && job.status === 'running')
        ? 'uncertain' : row.status,
      path: row.status === 'ready' ? path.join(this.store.root(projectId), row.sourceRelative) : undefined,
    })), requestedCount: catalog.assets.filter(row => row.sentAt).length }
  }
  prepare(item, project, settings) {
    const title = String(item.title || '').trim(), prompt = String(item.prompt || '').trim()
    if (!title || title.length > 100 || !prompt || prompt.length > 3000) throw new Error('素材需要名称（1–100字）与完整提示词（1–3000字）')
    const purpose = item.purpose || 'scene', ratio = item.ratio || '9:16'
    if (!purposes.includes(purpose) || !['9:16', '16:9', '1:1', '3:4', '4:3', '2.35:1'].includes(ratio)) throw new Error('素材用途或画幅无效')
    if (item.start != null && (!Number.isFinite(item.start) || item.start < 0 || item.start >= project.duration)) throw new Error('素材起点超出原片')
    if (item.end != null && (!Number.isFinite(item.end) || item.end <= (item.start || 0) || item.end > project.duration + .1)) throw new Error('素材终点超出原片')
    const referenceIds = item.referenceIds || []
    if (!Array.isArray(referenceIds) || referenceIds.length > 4 || referenceIds.some(id => !uuid.test(id))) throw new Error('最多选择四张本片参考素材')
    const style = project.visualPreferences?.style
    const styleNote = style ? style.name + '；' + String(style.definition || '').slice(0, 450) : '按口播内容选择合适的视觉语言'
    const effectivePrompt = prompt + '\n画幅：' + ratio + '。素材任务：' + purpose + '。\n全片画风：' + styleNote +
      (project.visualPreferences?.branch ? '\n分支：' + project.visualPreferences.branch.name : '') +
      '\n这是口播视频的独立画面素材，人物与原声由原片合成。不要增加主持人。字幕、标题、金额与关键标签由视频渲染器单独排版，图片不要添加这些文字、Logo或水印。'
    const slot = String(item.slot || title).slice(0, 120)
    return { title, prompt, effectivePrompt, purpose, ratio, slot, start: item.start ?? null, end: item.end ?? null, referenceIds,
      styleId: style?.id || null, styleName: style?.name || '按内容设计', model: settings.model,
      size: settings.size, fingerprint: hash(JSON.stringify({ prompt: effectivePrompt, model: settings.model, route: settings.route, size: settings.size, referenceIds })), redoOf: item.redoOf || null }
  }
  async generate(input) {
    if (!Array.isArray(input.images) || !input.images.length || input.images.length > 12) throw new Error('每批需提供 1–12 项素材任务')
    const settings = await this.settings.read()
    if (!settings.hub) throw new Error('口播生图需要「接口与密钥」插件；请先在插件管理里启用它')
    if (!settings.configured) throw new Error('请先在「设置 → 接口与密钥」配置 Seedream 密钥')
    const current = await this.store.get(input.projectId)
    const specs = input.images.map(item => this.prepare(item, current, settings))
    return this.store.start(input, async (project, signal, log) => {
      const catalog = await this.catalog(project.id), rows = []
      for (const spec of specs) {
        if (spec.redoOf && !catalog.assets.some(row => row.id === spec.redoOf)) throw new Error('要重做的素材不属于当前口播')
        const match = spec.redoOf ? null : catalog.assets.findLast(row => row.fingerprint === spec.fingerprint)
        if (match && !['ready', 'queued'].includes(match.status)) throw new Error('该请求已有失败或待核对记录，请查看素材后显式重做，未自动重复请求')
        if (match) rows.push(match)
        else {
          const row = { ...spec, id: randomUUID(), sourceRelative: '', status: 'queued', active: false, createdAt: new Date().toISOString(), operationId: input.operationId, generated: true }
          row.sourceRelative = 'images/' + row.id + '/original.image'
          catalog.assets.push(row); rows.push(row)
        }
      }
      await this.save(project.id, catalog)
      for (let index = 0; index < rows.length; index++) {
        signal.throwIfAborted()
        const row = rows[index]
        if (row.status === 'ready') {
          await this.verifiedFile(project.id, row)
          for (const previous of catalog.assets) if (previous.slot === row.slot) previous.active = previous.id === row.id
          log('复用已有素材：' + row.title)
          continue
        }
        const references = []
        for (const id of row.referenceIds) {
          const reference = catalog.assets.find(asset => asset.id === id && asset.status === 'ready')
          if (!reference) throw new Error('参考图必须是当前口播已完成的素材')
          const bytes = await readFile(await this.verifiedFile(project.id, reference))
          if (bytes.length > 10 * 1024 * 1024) throw new Error('单张参考素材超过 10 MB')
          references.push('data:' + reference.mime + ';base64,' + bytes.toString('base64'))
        }
        row.status = 'sending'; row.sentAt = new Date().toISOString()
        await this.save(project.id, catalog)
        log('正在生图 ' + (index + 1) + '/' + rows.length + ' · ' + row.title)
        try {
          const image = await this.request(settings, row.effectivePrompt, { signal, references, hub: this.hub })
          const folder = await this.folder(project.id, 'images/' + row.id)
          const file = path.join(folder, 'original' + image.suffix), temporary = file + '.tmp'
          row.sourceRelative = 'images/' + row.id + '/original' + image.suffix
          try { await writeFile(temporary, image.bytes, { flag: 'wx' }); await rename(temporary, file) } finally { await rm(temporary, { force: true }) }
          const probe = JSON.parse(await run(executable('ffprobe'), ['-v', 'error', '-show_streams', '-of', 'json', file], { timeout: 30000 }))
          const dimensions = probe.streams.find(stream => stream.width > 0 && stream.height > 0)
          if (!dimensions) throw new Error('生图文件无法解码，已保留原始结果供核对')
          Object.assign(row, { status: 'ready', mime: image.mime, suffix: image.suffix, model: image.model || settings.model, requestId: image.requestId, width: dimensions.width, height: dimensions.height, sha256: hash(image.bytes), completedAt: new Date().toISOString(), active: true })
          for (const previous of catalog.assets) if (previous.id !== row.id && previous.slot === row.slot) previous.active = false
          await this.save(project.id, catalog)
          log('已保存素材：' + row.title + ' · ' + row.width + '×' + row.height)
        } catch (error) {
          row.status = error.uncertain || signal.aborted ? 'uncertain' : 'failed'
          row.error = errorText(error); row.provider = error.details; row.finishedAt = new Date().toISOString()
          await this.save(project.id, catalog)
          throw error
        }
      }
      await this.save(project.id, catalog)
      await this.attach(project, catalog)
    })
  }
  async verifiedFile(projectId, row) {
    if (!uuid.test(row.id) || !['.image', '.png', '.jpg', '.webp'].some(suffix => row.sourceRelative === 'images/' + row.id + '/original' + suffix)) throw new Error('无效素材文件')
    const file = await this.store.projectPath(projectId, row.sourceRelative)
    const info = await stat(file), stamp = [info.size, info.mtimeMs, info.ctimeMs, row.sha256].join(':')
    if (this.verified.get(file) !== stamp) {
      if (hash(await readFile(file)) !== row.sha256) throw new Error('本地素材已改变，请核对后重新生成')
      this.verified.set(file, stamp)
    }
    return file
  }
  async attach(project, catalog = null) {
    catalog ||= await this.catalog(project.id)
    const active = project.creativeDirectory || 'creative'
    if (!/^creative(?:-[a-f\d-]{36})?$/u.test(active)) throw new Error('无效制作版本目录')
    try { await this.store.projectPath(project.id, active + '/project.json') } catch (error) { if (error.code === 'ENOENT') return { assets: catalog.assets }; throw error }
    const destination = await this.folder(project.id, active + '/assets/generated')
    for (const row of catalog.assets.filter(row => row.status === 'ready')) {
      const source = await this.verifiedFile(project.id, row)
      const filename = row.id + row.suffix
      if (!/^[a-f\d-]{36}\.(png|jpg|webp)$/u.test(filename)) throw new Error('无效素材格式')
      const target = path.join(destination, filename)
      try { if ((await lstat(target)).isSymbolicLink()) throw new Error('素材目标不能为软链接') } catch (error) { if (error.code !== 'ENOENT') throw error }
      await copyFile(source, target)
      row.renderRelative = active + '/assets/generated/' + filename
      row.compositionRelative = 'assets/generated/' + filename
    }
    await atomic(path.join(destination, 'manifest.json'), { assets: catalog.assets.filter(row => row.status === 'ready') })
    await this.save(project.id, catalog)
    return this.list(project.id)
  }
  async use(input) {
    return this.store.update(input, async project => {
      const catalog = await this.catalog(project.id), chosen = catalog.assets.find(row => row.id === input.assetId && row.status === 'ready')
      if (!chosen) throw new Error('请先选择本片已完成的素材')
      for (const row of catalog.assets) if (row.slot === chosen.slot) row.active = row.id === chosen.id
      await this.save(project.id, catalog); await this.attach(project, catalog)
    })
  }
  async asset(projectId, assetId) {
    if (!uuid.test(String(assetId))) throw new Error('无效素材标识')
    const catalog = await this.catalog(projectId), row = catalog.assets.find(asset => asset.id === assetId && asset.status === 'ready')
    if (!row) throw new Error('该素材尚未完成或不属于当前口播')
    return { row, file: await this.verifiedFile(projectId, row) }
  }
  async preview(input, signal) {
    const { row, file } = await this.asset(input.projectId, input.assetId)
    const key = input.projectId + '/' + row.id
    if (!this.previews.has(key)) this.previews.set(key, (async () => {
      const target = path.join(await this.folder(input.projectId, 'images/' + row.id), 'preview.jpg')
      try { return await readFile(target) } catch (error) { if (error.code !== 'ENOENT') throw error }
      const temporary = target + '.' + randomUUID() + '.tmp.jpg'
      try {
        await run(executable('ffmpeg'), ['-v','error','-i',file,'-frames:v','1','-vf',"scale=w='min(1024,iw)':h='min(1024,ih)':force_original_aspect_ratio=decrease",'-q:v','3',temporary], { signal, timeout: 30000 })
        await rename(temporary, target)
      } finally { await rm(temporary, { force: true }) }
      return readFile(target)
    })().catch(error => { this.previews.delete(key); throw error }))
    const bytes = await this.previews.get(key)
    return { source: 'data:image/jpeg;base64,' + bytes.toString('base64'), width: row.width, height: row.height }
  }
  async media(input, signal) {
    const { row, file } = await this.asset(input.projectId, input.assetId)
    const info = await stat(file), offset = input.offset ?? 0
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > info.size) throw new Error('无效素材位置')
    signal?.throwIfAborted()
    const handle = await open(file, 'r')
    try {
      const bytes = Buffer.alloc(Math.min(256 * 1024, info.size - offset))
      const result = await handle.read(bytes, 0, bytes.length, offset)
      return { data: bytes.subarray(0, result.bytesRead).toString('base64'), size: info.size, next: offset + result.bytesRead, mime: row.mime }
    } finally { await handle.close() }
  }
}
