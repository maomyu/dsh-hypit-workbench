import { randomUUID } from 'node:crypto'
import { mkdir, open, rm } from 'node:fs/promises'
import path from 'node:path'

const MAX_CHUNK = 256 * 1024
const MAX_FILE = 2 * 1024 * 1024 * 1024

export class VideoUploads {
  constructor(directory, store) { this.directory = path.join(directory, 'imports'); this.store = store; this.entries = new Map() }
  entry(id) { const item = this.entries.get(id); if (!item) throw new Error('导入已结束，请重新选择视频'); return item }
  async begin(input) {
    if (!Number.isSafeInteger(input.size) || input.size < 1 || input.size > MAX_FILE) throw new Error('请选择不超过 2 GB 的视频')
    if (this.entries.size >= 4) throw new Error('请先完成或取消正在导入的视频')
    const id = randomUUID()
    const directory = path.join(this.directory, id)
    await mkdir(directory, { recursive: true })
    const file = path.join(directory, 'source')
    const handle = await open(file, 'wx'); await handle.close()
    this.entries.set(id, { id, directory, file, size: input.size, offset: 0, chain: Promise.resolve() })
    return { uploadId: id, chunkSize: MAX_CHUNK }
  }
  async locked(id, action) {
    const item = this.entry(id)
    const next = item.chain.catch(() => {}).then(() => action(item))
    item.chain = next
    return next
  }
  async chunk(input) {
    return this.locked(input.uploadId, async item => {
      if (!Number.isSafeInteger(input.offset) || input.offset < 0 || typeof input.data !== 'string' || input.data.length > Math.ceil(MAX_CHUNK / 3) * 4 || !/^[A-Za-z0-9+/]*={0,2}$/u.test(input.data)) throw new Error('视频传输数据无效')
      const bytes = Buffer.from(input.data, 'base64')
      if (!bytes.length || bytes.length > MAX_CHUNK || input.offset + bytes.length > item.size) throw new Error('视频分块大小无效')
      const handle = await open(item.file, 'r+')
      try {
        if (input.offset < item.offset) {
          if (input.offset + bytes.length > item.offset) throw new Error('视频传输位置已变化')
          const previous = Buffer.alloc(bytes.length); await handle.read(previous, 0, bytes.length, input.offset)
          if (!previous.equals(bytes)) throw new Error('重试的数据与原分块不一致')
          return { next: item.offset, size: item.size }
        }
        if (input.offset !== item.offset) throw new Error('视频传输位置不连续')
        let written = 0
        while (written < bytes.length) {
          const count = (await handle.write(bytes, written, bytes.length - written, item.offset + written)).bytesWritten
          if (!count) throw new Error('视频写入中断，请重试导入')
          written += count
        }
        item.offset += bytes.length
        return { next: item.offset, size: item.size }
      } finally { await handle.close() }
    })
  }
  async finish(input, signal) {
    return this.locked(input.uploadId, async item => {
      if (item.offset !== item.size) throw new Error('视频尚未传输完成')
      try { return await this.store.import({ source: item.file, owned: input.owned, name: input.name || input.filename }, signal) }
      finally { this.entries.delete(item.id); await rm(item.directory, { recursive: true, force: true }) }
    })
  }
  async cancel(id) {
    if (!this.entries.has(id)) return {}
    return this.locked(id, async item => { this.entries.delete(id); await rm(item.directory, { recursive: true, force: true }); return {} })
  }
  async dispose() { await Promise.allSettled([...this.entries.keys()].map(id => this.cancel(id))) }
}
