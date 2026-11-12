/**
 * Panel conversation history: which host sessions belong to which project.
 *
 * The panel agent's session is already persisted by the host (one session per
 * conversation, under ~/.dsh/sessions/<cwd>/). What was missing is the link
 * back: the panel forgot the session id on every restart. This index keeps,
 * per target key (a Hypit project root or `clip:<id>`), the list of
 * conversations with a title, timestamps and turn count, newest first.
 *
 * File: <data dir>/chat-history.json, mode 600. No message text beyond a
 * short title is stored here; the transcript lives in the host session.
 */
import { chmod, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export const MAX_PER_TARGET = 40
const TITLE_MAX = 48

export function historyFile(base = process.env.DSH_HOME || join(homedir(), '.dsh')) {
  return join(base, 'hypit-workbench', 'chat-history.json')
}

export function titleFrom(text) {
  const clean = String(text ?? '')
    .replace(/^【引用原句】[\s\S]*?\n\n/u, '')
    .replace(/\s+/gu, ' ')
    .trim()
  if (!clean) return '新对话'
  return clean.length > TITLE_MAX ? clean.slice(0, TITLE_MAX - 1) + '…' : clean
}

function sanitizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (typeof raw.sessionId !== 'string' || !/^session-[\w-]{1,120}$/u.test(raw.sessionId)) return null
  return {
    sessionId: raw.sessionId,
    title: typeof raw.title === 'string' && raw.title ? raw.title.slice(0, TITLE_MAX) : '新对话',
    createdAt: Number(raw.createdAt) || Date.now(),
    updatedAt: Number(raw.updatedAt) || Number(raw.createdAt) || Date.now(),
    turns: Math.max(0, Number(raw.turns) || 0),
    model: typeof raw.model === 'string' ? raw.model.slice(0, 120) : '',
    provider: typeof raw.provider === 'string' ? raw.provider.slice(0, 120) : '',
  }
}

export class ChatHistory {
  constructor(file = historyFile()) {
    this.file = file
    this.targets = {}
    this.loaded = null
    this.queue = Promise.resolve()
  }

  load() {
    this.loaded ??= (async () => {
      try {
        const raw = JSON.parse(await readFile(this.file, 'utf8'))
        for (const [key, list] of Object.entries(raw?.targets ?? {})) {
          if (typeof key !== 'string' || !Array.isArray(list)) continue
          const entries = list.map(sanitizeEntry).filter(Boolean)
          if (entries.length) this.targets[key] = entries.slice(0, MAX_PER_TARGET)
        }
      } catch {}
    })()
    return this.loaded
  }

  async list(key) {
    await this.load()
    return [...(this.targets[key] ?? [])].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async latest(key) {
    return (await this.list(key))[0] ?? null
  }

  async get(key, sessionId) {
    return (await this.list(key)).find(entry => entry.sessionId === sessionId) ?? null
  }

  /** Insert or patch one conversation. */
  update(key, sessionId, patch) {
    return this.write(async () => {
      const list = this.targets[key] ?? []
      const at = list.findIndex(entry => entry.sessionId === sessionId)
      const now = Date.now()
      const base = at >= 0 ? list[at] : { sessionId, title: '新对话', createdAt: now, updatedAt: now, turns: 0, model: '', provider: '' }
      const next = sanitizeEntry({ ...base, ...patch, sessionId })
      if (at >= 0) list[at] = next
      else list.unshift(next)
      list.sort((a, b) => b.updatedAt - a.updatedAt)
      this.targets[key] = list.slice(0, MAX_PER_TARGET)
      return next
    })
  }

  remove(key, sessionId) {
    return this.write(async () => {
      const list = this.targets[key] ?? []
      this.targets[key] = list.filter(entry => entry.sessionId !== sessionId)
      if (!this.targets[key].length) delete this.targets[key]
    })
  }

  write(mutate) {
    const run = this.queue.then(async () => {
      await this.load()
      const result = await mutate()
      await mkdir(dirname(this.file), { recursive: true, mode: 0o700 })
      const temporary = `${this.file}.${randomUUID()}.tmp`
      try {
        await writeFile(temporary, JSON.stringify({ version: 1, targets: this.targets }, null, 2), { mode: 0o600, flag: 'wx' })
        await rename(temporary, this.file)
        await chmod(this.file, 0o600)
      } finally {
        await rm(temporary, { force: true })
      }
      return result
    })
    this.queue = run.catch(() => {})
    return run
  }
}
