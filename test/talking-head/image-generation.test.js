import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, mkdir, stat, symlink } from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { ImageSettings, requestImage } from '../../src/talking-head/image-provider.js'
import { ImageAssets } from '../../src/talking-head/image-assets.js'
import { StudioStore, atomic } from '../../src/talking-head/store.js'
import { run, executable } from '../../src/talking-head/process.js'
import { resolveClipRequest as resolveConversationRequest } from '../../src/talking-head/bindings.js'

const root = await mkdtemp(path.join(os.tmpdir(), 'wanggan-images-'))
const video = path.join(root, 'source.mp4'), picture = path.join(root, 'picture.png')
await run(executable('ffmpeg'), ['-v','error','-f','lavfi','-i','color=c=red:s=160x240:r=20:d=2','-c:v','libx264','-pix_fmt','yuv420p',video])
await run(executable('ffmpeg'), ['-v','error','-i',video,'-frames:v','1',picture])
const bytes = await readFile(picture), checksum = value => createHash('sha256').update(value).digest('hex')
// A stand-in for the 接口与密钥 hub (service mediaProviders): same public contract, no keys.
function fakeHub({ configured = true, generate } = {}) {
  return {
    calls: [],
    async status() { return { image: { seedream: configured } } },
    settings() { return { product: 'Seedream 5.0 Pro', model: 'ep-unit-test', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', defaults: { size: '2K' } } },
    async generateImage(request) { this.calls.push(request); return generate ? generate(request) : { model: 'resolved-model', requestId: 'req-1', images: [{ buffer: bytes, mime: 'image/png', suffix: '.png' }] } },
  }
}
const overdue = () => Object.assign(new Error('账号已欠费，请在服务商控制台补足余额后重试（AccountOverdueError）'), { details: { status: 403, code: 'AccountOverdueError' } })
const spec = { title: '购物袋', slot: 'shopping', prompt: '纸上展开的红色购物袋与少量生活物件', purpose: 'object', ratio: '9:16', start: 0, end: 2 }
const stores = []
async function fixture(request) {
  const directory = path.join(root, randomUUID()), settings = new ImageSettings(fakeHub())
  const store = new StudioStore(directory); stores.push(store)
  const project = (await store.import({ source: video, owned: true }, new AbortController().signal)).project
  const images = new ImageAssets(store, settings, { request })
  const generate = async (items = [spec], extra = {}) => {
    const result = await images.generate({ op: 'generate_images', projectId: project.id, revision: (await store.get(project.id)).revision, operationId: randomUUID(), images: items, ...extra })
    await store.jobs.get(result.job.id)?.promise
    return (await store.job({ projectId: project.id, jobId: result.job.id })).job
  }
  return { directory, settings, store, project, images, generate }
}
const image = { bytes, mime: 'image/png', suffix: '.png', model: 'ep-unit-test', requestId: 'req-test' }

test('image settings come from the hub and never carry a key', async () => {
  const view = await new ImageSettings(fakeHub()).view()
  assert.equal(view.configured, true); assert.equal(view.hub, true)
  assert.equal(view.model, 'ep-unit-test'); assert.equal(view.size, '2K')
  assert.equal(view.managedBy, '设置 → 接口与密钥')
  assert.ok(!('apiKey' in view))
  const missing = await new ImageSettings(() => undefined).view()
  assert.equal(missing.hub, false); assert.equal(missing.configured, false)
  assert.equal((await new ImageSettings(fakeHub({ configured: false })).view()).configured, false)
})
test('requestImage goes through the hub with one Seedream image and keeps the uncertain flag', async () => {
  const hub = fakeHub()
  const settings = await new ImageSettings(hub).read()
  const result = await requestImage(settings, '纸上物件', { hub, references: ['data:image/png;base64,AA'] })
  assert.equal(hub.calls[0].provider, 'seedream'); assert.equal(hub.calls[0].count, 1); assert.equal(hub.calls[0].size, '2K')
  assert.equal(hub.calls[0].caller, '视频工作台 · 网感口播'); assert.equal(hub.calls[0].referenceImages.length, 1)
  assert.equal(result.model, 'resolved-model'); assert.equal(result.requestId, 'req-1')
  assert.equal(checksum(result.bytes), checksum(bytes))
  const flaky = fakeHub({ generate: () => { throw Object.assign(new Error('请求超时，服务方可能仍在处理'), { uncertain: true }) } })
  await assert.rejects(requestImage(settings, 'test', { hub: flaky }), error => error.uncertain === true)
  await assert.rejects(requestImage(settings, 'test', { hub: undefined }), /接口与密钥/)
  await assert.rejects(requestImage({ ...settings, configured: false }, 'test', { hub }), /设置 → 接口与密钥/)
})
test('generated originals survive reload and attach only after creative initialization; cached generation is free', async () => {
  let requests = 0
  const f = await fixture(async () => { requests++; return image })
  const first = await f.generate()
  assert.equal(first.status, 'succeeded', first.error)
  const listed = await f.images.list(f.project.id), row = listed.assets[0]
  assert.equal(row.status, 'ready'); assert.equal(row.width, 160); assert.equal(row.sha256, checksum(bytes))
  await assert.rejects(stat(path.join(f.store.root(f.project.id), 'creative')), { code: 'ENOENT' })
  const second = await f.generate()
  assert.equal(second.status, 'succeeded', second.error); assert.equal(requests, 1)
  const fresh = new ImageAssets(f.store, f.settings)
  assert.equal((await fresh.list(f.project.id)).assets[0].sha256, row.sha256)
  const creative = path.join(f.store.root(f.project.id), 'creative')
  await mkdir(creative); await atomic(path.join(creative, 'project.json'), {})
  const attached = await fresh.attach(f.project)
  assert.equal(attached.assets[0].compositionRelative, 'assets/generated/' + row.id + '.png')
  assert.equal(attached.assets[0].sourceRelative, 'images/' + row.id + '/original.png')
  assert.equal(checksum(await readFile(path.join(f.store.root(f.project.id), attached.assets[0].renderRelative))), row.sha256)
  const preview = await fresh.preview({ projectId: f.project.id, assetId: row.id })
  assert.match(preview.source, /^data:image\/jpeg;base64,/)
  const chunk = await fresh.media({ projectId: f.project.id, assetId: row.id })
  assert.equal(checksum(Buffer.from(chunk.data, 'base64')), row.sha256)
})
test('partial batches retain successful and queued assets; failed fingerprints are not retried implicitly', async () => {
  let requests = 0
  const f = await fixture(async () => { requests++; if (requests === 2) throw overdue(); return image })
  const items = [spec, { ...spec, title: '账本', slot: 'ledger', prompt: '展开的无字账本' }, { ...spec, title: '储物盒', slot: 'box', prompt: '一个整洁的纸盒' }]
  const job = await f.generate(items)
  assert.equal(job.status, 'failed'); assert.match(job.error, /欠费/)
  const list = await f.images.list(f.project.id)
  assert.deepEqual(list.assets.map(row => row.status), ['ready', 'failed', 'queued'])
  assert.equal(list.requestedCount, 2)
  assert.equal((await f.generate(items)).status, 'failed'); assert.equal(requests, 2)
  const retried = await f.generate([{ ...items[1], redoOf: list.assets[1].id }, items[2]])
  assert.equal(retried.status, 'succeeded', retried.error); assert.equal(requests, 4)
})
test('uncertain outcomes remain durable and never trigger a blind reissue; explicit redo is not capped', async () => {
  let requests = 0
  const f = await fixture(async () => { requests++; const error = new Error('结果未知'); error.uncertain = true; throw error })
  assert.equal((await f.generate()).status, 'failed')
  assert.equal((await f.images.list(f.project.id)).assets[0].status, 'uncertain')
  assert.equal((await f.generate()).status, 'failed'); assert.equal(requests, 1)
  const row = (await f.images.list(f.project.id)).assets[0]
  await f.generate([{ ...spec, redoOf: row.id }]); assert.equal(requests, 2)
})

test('no per-clip image cap: many requests in a row all go out', async () => {
  let requests = 0
  const f = await fixture(async () => { requests++; return image })
  for (let index = 0; index < 3; index++) {
    const batch = Array.from({ length: 4 }, (_, n) => ({ ...spec, title: `素材 ${index}-${n}`, slot: `slot-${index}-${n}`, prompt: `不同的画面 ${index}-${n}` }))
    assert.equal((await f.generate(batch)).status, 'succeeded')
  }
  assert.equal(requests, 12)
})
test('image variants preserve old files, use owned references and allow choosing an earlier version', async () => {
  let referenceCount = 0
  const f = await fixture(async (_settings, _prompt, options) => { referenceCount = options.references.length; return image })
  await f.generate(); const old = (await f.images.list(f.project.id)).assets[0]
  assert.equal((await f.generate([{ ...spec, prompt: '不同角度的红色购物袋', redoOf: old.id, referenceIds: [old.id] }])).status, 'succeeded')
  assert.equal(referenceCount, 1)
  const variants = (await f.images.list(f.project.id)).assets
  assert.equal(variants.length, 2); assert.equal(variants[0].active, false); assert.equal(variants[1].active, true)
  await f.images.use({ projectId: f.project.id, assetId: old.id, revision: f.project.revision, operationId: randomUUID() })
  assert.equal((await f.images.list(f.project.id)).assets[0].active, true)
  await assert.rejects(f.images.preview({ projectId: f.project.id, assetId: randomUUID() }), /不属于/)
})
test('asset writes reject symlink escape and image tools reject cross-conversation project ids', async () => {
  const f = await fixture(async () => image)
  await symlink(root, path.join(f.store.root(f.project.id), 'images'))
  await assert.rejects(f.images.list(f.project.id), /软链接/)
  const conversations = { current: async () => f.project }
  await assert.rejects(resolveConversationRequest({ op: 'generate_images', projectId: randomUUID() }, 'session-own', conversations), /所属的口播/)
  assert.equal((await resolveConversationRequest({ op: 'images_list' }, 'session-own', conversations)).input.projectId, f.project.id)
})
test.after(async () => { await Promise.all(stores.map(store => store.dispose())); await rm(root, { recursive: true, force: true }) })
