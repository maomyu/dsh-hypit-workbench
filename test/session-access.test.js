import test from 'node:test'
import assert from 'node:assert/strict'
import { askInPanel, grantAccess, normalizeAnswers, panelGuide, summarizeEvents } from '../src/session-access.js'

function fakeSession() {
  const events = []
  return { events, append: (type, data) => events.push({ type, data }) }
}

test('grantAccess full pins danger-full-access and never-ask', () => {
  const session = fakeSession()
  assert.equal(grantAccess(session, 'full'), true)
  assert.deepEqual(session.events, [
    { type: 'permission/preset', data: { preset: 'danger-full-access' } },
    { type: 'sandbox/mode', data: { mode: 'danger-full-access' } },
    { type: 'approval/policy', data: { policy: 'never' } },
  ])
})

test('grantAccess workspace confines writes but still never blocks on approval', () => {
  const session = fakeSession()
  grantAccess(session, 'workspace')
  assert.equal(session.events[1].data.mode, 'workspace-write')
  assert.equal(session.events[2].data.policy, 'never')
})

test('grantAccess tolerates a missing or failing session', () => {
  assert.equal(grantAccess(undefined), false)
  assert.equal(grantAccess({ append() { throw new Error('closed') } }), false)
})

test('summarizeEvents keeps text, tool names and the real turn error', () => {
  const result = summarizeEvents([
    { type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '跑一下' }] } },
    { type: 'user/message', data: { source: { kind: 'runtime-context' }, content: [{ type: 'text', text: 'ctx' }] } },
    { type: 'tool/call', data: { name: 'bash', arguments: '{"command":"ls","description":"List files"}' } },
    { type: 'assistant/message', data: { content: [{ type: 'text', text: ' 好了 ' }] } },
    { type: 'turn/end', data: { reason: { kind: 'error', error: { message: 'Insufficient Balance' } } } },
  ])
  assert.deepEqual(result.messages, [
    { role: 'user', text: '跑一下' },
    { role: 'tool', text: 'bash', detail: 'List files' },
    { role: 'assistant', text: '好了' },
    { role: 'note', text: '这一轮没跑完：Insufficient Balance', tone: 'error' },
  ])
  assert.equal(result.error, 'Insufficient Balance')
})

test('summarizeEvents reports no error for a completed turn', () => {
  const result = summarizeEvents([{ type: 'turn/end', data: { reason: { kind: 'completed' } } }])
  assert.equal(result.error, '')
})

test('summarizeEvents marks a user stop', () => {
  const result = summarizeEvents([{ type: 'turn/end', data: { reason: { kind: 'aborted', reason: { kind: 'user' } } } }])
  assert.equal(result.stopped, true)
  assert.deepEqual(result.messages, [{ role: 'note', text: '已停止' }])
})

test('askInPanel parks a question until the panel answers', async () => {
  const chat = {}
  const pending = askInPanel(chat, { questions: [{ id: 'q', question: '跑哪个？', options: [{ label: 'A' }, { label: 'B' }] }] })
  assert.equal(chat.question.questions[0].options.length, 2)
  chat.question.resolve(normalizeAnswers(chat.question.questions, [{ id: 'q', selected: ['B', 'Z'] }]))
  assert.deepEqual(await pending, { answers: [{ id: 'q', selected: ['B'] }] })
  assert.equal(chat.question, null)
})

test('askInPanel rejects when the turn aborts', async () => {
  const chat = {}
  const controller = new AbortController()
  const pending = askInPanel(chat, { questions: [{ id: 'q', question: '?' }], signal: controller.signal })
  controller.abort(new Error('stop'))
  await assert.rejects(pending, /stop/)
  assert.equal(chat.question, null)
})

test('normalizeAnswers keeps custom text and fills skipped questions', () => {
  const questions = [
    { id: 'a', options: [{ label: 'x' }], multiSelect: false },
    { id: 'b', options: [], multiSelect: false },
  ]
  assert.deepEqual(normalizeAnswers(questions, [{ id: 'a', selected: ['x'], custom: ' 自己写 ' }]), {
    answers: [{ id: 'a', selected: [], custom: '自己写' }, { id: 'b', selected: [] }],
  })
})

test('panelGuide pins the assistant to the project', () => {
  const text = panelGuide('/Users/me/Hypit/demo')
  assert.match(text, /\/Users\/me\/Hypit\/demo/)
  assert.match(text, /ask_user（/)
})
