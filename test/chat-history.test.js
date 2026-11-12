/**
 * Panel conversation history: each project keeps its own conversations,
 * survives a restart (new host instance), and can switch between them.
 * Drives the real host class against a fake agent runtime and session store.
 * Needs the DSH runtime resolvable (see scripts/test-host.sh).
 */
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const home = await mkdtemp(join(tmpdir(), 'hw-chat-'))
process.env.DSH_HOME = join(home, '.dsh')

let HypitWorkbench
try {
  ;({ default: HypitWorkbench } = await import('../src/host.js'))
} catch (error) {
  test('host chat history (skipped: DSH runtime not resolvable)', { skip: String(error?.message ?? error).slice(0, 120) }, () => {})
}

async function project(name) {
  const root = join(home, 'Hypit', name)
  await mkdir(root, { recursive: true })
  await writeFile(join(root, 'package.json'), JSON.stringify({ name, hypit: { project: true } }))
  return root
}

/** Disk = Map<sessionId, { header, events }>; agents append events there as they "run". */
function runtime(disk) {
  let seq = 0
  const live = new Map()
  function makeAgent(session) {
    const agent = {
      session: {
        id: session.header.id,
        header: session.header,
        snapshotEvents: () => [...session.events],
        append: () => {},
      },
      followup(message) {
        session.events.push({ type: 'user/message', seq: seq++, time: Date.now(), data: { content: message.content, source: { kind: 'user' } } })
      },
      async runMaintenance(fn) { await fn({ throwIfAborted() {} }) },
      async whenIdle() {
        const said = session.events.at(-1)?.data?.content?.[0]?.text ?? ''
        session.events.push({ type: 'assistant/message', seq: seq++, time: Date.now(), data: { content: [{ type: 'text', text: '收到：' + said }] } })
      },
      cancel() {},
    }
    return agent
  }
  const agents = {
    async create({ sessionId, meta, setup }) {
      const session = { header: { id: sessionId, cwd: meta.cwd, origin: meta.origin, createdAt: Date.now() }, events: [] }
      disk.set(sessionId, session)
      const agent = makeAgent(session)
      await setup?.({ tools: { register() {}, restrict() {} }, systemPrompt: { context() {} } })
      live.set(sessionId, agent)
      return { agent, async dispose() { live.delete(sessionId) } }
    },
    async resume({ resumeSessionId, setup }) {
      const session = disk.get(resumeSessionId)
      if (!session) throw new Error('not found')
      const agent = makeAgent(session)
      await setup?.({ tools: { register() {}, restrict() {} }, systemPrompt: { context() {} } })
      live.set(resumeSessionId, agent)
      return { agent, async dispose() { live.delete(resumeSessionId) } }
    },
  }
  const sessionPersistence = {
    async open(id) {
      const session = disk.get(id)
      if (!session) throw new Error('not found')
      return { async read() { return { events: [...session.events] } }, async close() {} }
    },
    async list() { return [...disk.values()].map(item => ({ header: item.header })) },
  }
  const services = {
    agents,
    sessionPersistence,
    sessions: { get: () => undefined, async flush() { return true } },
    agentDefaultModel: { currentSelection: () => ({ provider: 'deepseek', model: 'deepseek-chat' }) },
  }
  return {
    live,
    ctx: { ...services, get: name => services[name], logger: { warn() {}, info() {} }, invocation: {} },
  }
}

function host(ctx, roots) {
  const instance = Object.create(HypitWorkbench.prototype)
  instance.ctx = ctx
  instance.roots = roots
  instance.allowed = new Set()
  instance.chats = new Map()
  instance.clips = null
  return instance
}

async function settle() {
  await new Promise(resolve => setTimeout(resolve, 10))
}

if (HypitWorkbench) {
  const { ChatHistory } = await import('../src/chat-history.js')
  const disk = new Map()
  const a = await project('alpha')
  const b = await project('beta')
  const roots = [join(home, 'Hypit')]

  function boot() {
    const { ctx, live } = runtime(disk)
    const hw = host(ctx, roots)
    hw.history = new ChatHistory()
    hw.allowed = new Set([a, b])
    hw.requireProject = async path => {
      if (path !== a && path !== b) throw new Error('unknown')
      return path
    }
    return { hw, live }
  }

  test('a conversation survives a restart and reopens automatically', async () => {
    let { hw } = boot()
    const first = await hw.request({ op: 'chat', path: a, message: '把开头改得更抓人' })
    assert.ok(first.sessionId)
    await settle()
    let list = await hw.request({ op: 'chat-list', path: a })
    assert.equal(list.conversations.length, 1)
    assert.equal(list.conversations[0].title, '把开头改得更抓人')
    assert.equal(list.conversations[0].turns, 1)

    // "Restart": a brand-new host instance, nothing live.
    ;({ hw } = boot())
    const cold = await hw.request({ op: 'chat-poll', path: a, cursor: 0 })
    assert.equal(cold.exists, true, 'last conversation is found after restart')
    assert.equal(cold.cold, true)
    assert.deepEqual(cold.messages.map(item => item.role), ['user', 'assistant'])
    assert.equal(cold.sessionId, first.sessionId)

    // Next message continues the same session (resumed, not new).
    const again = await hw.request({ op: 'chat', path: a, message: '再短一点' })
    assert.equal(again.sessionId, first.sessionId)
    await settle()
    list = await hw.request({ op: 'chat-list', path: a })
    assert.equal(list.conversations.length, 1)
    assert.equal(list.conversations[0].turns, 2)
    assert.equal(list.conversations[0].title, '把开头改得更抓人', 'title keeps the first message')
  })

  test('new conversation keeps the old one; switching reopens it', async () => {
    const { hw } = boot()
    const before = (await hw.request({ op: 'chat-list', path: a })).conversations[0].sessionId
    await hw.request({ op: 'chat-reset', path: a })
    const fresh = await hw.request({ op: 'chat', path: a, message: '换个思路：做成问答体' })
    assert.notEqual(fresh.sessionId, before)
    await settle()
    let list = await hw.request({ op: 'chat-list', path: a })
    assert.deepEqual(list.conversations.map(item => item.sessionId), [fresh.sessionId, before], 'newest first')
    assert.equal(list.current, fresh.sessionId)

    const opened = await hw.request({ op: 'chat-open', path: a, sessionId: before })
    assert.equal(opened.sessionId, before)
    assert.equal(opened.messages.filter(item => item.role === 'user').length, 2)
    const cont = await hw.request({ op: 'chat', path: a, message: '回到第一个方案', sessionId: before })
    assert.equal(cont.sessionId, before)
    await settle()
    list = await hw.request({ op: 'chat-list', path: a })
    assert.equal(list.conversations[0].sessionId, before, 'touched conversation moves to the top')
  })

  test('projects keep separate conversations', async () => {
    const { hw } = boot()
    const inB = await hw.request({ op: 'chat', path: b, message: '这是 beta 项目' })
    await settle()
    const listA = await hw.request({ op: 'chat-list', path: a })
    const listB = await hw.request({ op: 'chat-list', path: b })
    assert.ok(!listA.conversations.some(item => item.sessionId === inB.sessionId))
    assert.deepEqual(listB.conversations.map(item => item.sessionId), [inB.sessionId])
    const pollA = await hw.request({ op: 'chat-poll', path: a, cursor: 0 })
    assert.ok(!pollA.messages.some(item => item.text === '这是 beta 项目'))
  })

  test('remove takes it off the list but leaves the session file', async () => {
    const { hw } = boot()
    const list = await hw.request({ op: 'chat-list', path: a })
    const victim = list.conversations.find(item => item.sessionId !== list.current)
    await hw.request({ op: 'chat-delete', path: a, sessionId: victim.sessionId })
    const after = await hw.request({ op: 'chat-list', path: a })
    assert.ok(!after.conversations.some(item => item.sessionId === victim.sessionId))
    assert.ok(disk.has(victim.sessionId), 'host session stays on disk')
    const refused = await hw.request({ op: 'chat-open', path: a, sessionId: victim.sessionId })
    assert.equal(refused.error.code, 'unknown-chat')
  })

  test('sessions made before the index existed are backfilled per project', async () => {
    const id = 'session-legacy-0001'
    disk.set(id, {
      header: { id, cwd: b, origin: 'subagent', createdAt: 1_700_000_000_000 },
      events: [
        { type: 'user/message', time: 1_700_000_000_000, data: { content: [{ type: 'text', text: '老对话：剪掉口误' }], source: { kind: 'user' } } },
        { type: 'assistant/message', time: 1_700_000_001_000, data: { content: [{ type: 'text', text: '好的' }] } },
      ],
    })
    const { hw } = boot()
    const list = await hw.request({ op: 'chat-list', path: b })
    const legacy = list.conversations.find(item => item.sessionId === id)
    assert.ok(legacy, 'legacy panel session appears')
    assert.equal(legacy.title, '老对话：剪掉口误')
    assert.ok(!(await hw.request({ op: 'chat-list', path: a })).conversations.some(item => item.sessionId === id))
  })
}
