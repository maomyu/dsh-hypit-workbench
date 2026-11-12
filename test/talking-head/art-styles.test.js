import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { artStyle, artStyles, artStyleBranches, artStyleComponents, artStyleOrchestrations, visualPreferences, fullVideoPrompt, useSelectedStyle } from '../../src/talking-head/art-styles.js'
import { StudioStore, atomic } from '../../src/talking-head/store.js'
import { ClipBindings, resolveClipRequest as resolveConversationRequest } from '../../src/talking-head/bindings.js'

test('selected art style persists with the video, reaches its conversation, and governs new production', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'wanggan-style-'))
  const id = '11111111-1111-4111-8111-111111111111', otherId = '22222222-2222-4222-8222-222222222222'
  const store = new StudioStore(directory)
  try {
    const base = { revision: 0, operations: [], transcript: [], versions: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await atomic(store.file(id), { ...base, id, sessionId: 'first' })
    await atomic(store.file(otherId), { ...base, id: otherId, sessionId: 'other' })
    const selection = { projectId: id, revision: 0, operationId: 'choose-ink' }
    await store.update(selection, project => { project.visualPreferences = visualPreferences({ styleId: 'F10', orchestrationId: 'relay' }) })
    const reopened = new StudioStore(directory), sessions = new ClipBindings(reopened)
    sessions.bind('first', id)
    sessions.bind('other', otherId)
    const { context } = await resolveConversationRequest({ op: 'context' }, 'first', sessions)
    assert.equal(context.project.visualPreferences.style.recipe, 'ink')
    assert.equal((await resolveConversationRequest({ op: 'context' }, 'other', sessions)).context.project.visualPreferences, undefined)
    assert.match(context.project.visualPreferences.style.referenceProject, /production-recipes\/ink/)
    const resolved = await resolveConversationRequest({ op: 'studio', command: 'init', options: { request: '保留原声' } }, 'first', sessions)
    assert.equal(resolved.input.options.recipe, 'ink')
    assert.equal(resolved.input.options.orchestration, 'relay')
    assert.equal(resolved.input.options.request, '保留原声')
    assert.match(fullVideoPrompt(context.project.visualPreferences), /水墨写意/)
    assert.match(fullVideoPrompt(context.project.visualPreferences), /同物接力/)
    assert.doesNotMatch(fullVideoPrompt(context.project.visualPreferences), /自主选择母画风/)
    await assert.rejects(resolveConversationRequest({ op: 'studio', command: 'init', options: { recipe: 'minimal' } }, 'first', sessions), /当前视频已选/)
    await assert.rejects(resolveConversationRequest({ op: 'studio', command: 'init', options: { style: 'clay' } }, 'first', sessions), /当前视频已选/)
    await assert.rejects(store.update({ ...selection, operationId: 'stale-choice' }, project => { project.visualPreferences = visualPreferences({ styleId: 'F11' }) }), /已更新/)
    await store.update({ projectId: id, revision: 1, operationId: 'automatic' }, project => { project.visualPreferences = visualPreferences({ styleId: null }) })
    assert.equal((await reopened.get(id)).visualPreferences.style, null)
    assert.match(fullVideoPrompt(null), /自主选择母画风/)
    const original = { op: 'studio', command: 'init', options: { recipe: 'minimal' } }
    assert.deepEqual(useSelectedStyle(original, {}), original)
    await reopened.dispose()
  } finally { await store.dispose(); await rm(directory, { recursive: true, force: true }) }
})

test('style choices are limited to the original library and cannot select arbitrary files', () => {
  assert.equal(artStyles.length, 19)
  assert.equal(artStyle('F19').recipe, 'woodcut')
  assert.equal(artStyleBranches.length, 38)
  assert.equal(artStyleComponents.length, 43)
  assert.equal(artStyleOrchestrations.length, 8)
  assert.throws(() => artStyle('A13'), /有效画风/)
  assert.throws(() => artStyle('../../private'), /有效画风/)
  assert.throws(() => artStyle(undefined), /有效画风/)
  assert.throws(() => artStyle({ id: 'A13' }), /有效画风/)
  assert.throws(() => visualPreferences({ styleId: 'F10', branchId: 'A09' }), /分支必须/)
  const choices = visualPreferences({ styleId: 'F07', branchId: 'A09', componentId: 'A18', orchestrationId: 'tracking' })
  const request = useSelectedStyle({ op: 'studio', command: 'init' }, { visualPreferences: choices })
  assert.deepEqual(request.options, { recipe: 'blueprint', branch: 'A09', components: 'A18', orchestration: 'tracking' })
  assert.match(fullVideoPrompt(choices), /工程蓝图/)
  assert.equal(useSelectedStyle({ op: 'studio', command: 'init' }, { visualPreferences: visualPreferences({ styleId: null, orchestrationId: 'relay' }) }).options.orchestration, 'relay')
})

test('clip bindings keep each panel chat on its own clip', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'wanggan-bind-'))
  const id = '33333333-3333-4333-8333-333333333333'
  const store = new StudioStore(directory)
  try {
    const base = { revision: 0, operations: [], transcript: [{ start: 0, end: 1, text: '一' }], versions: [], deleted: [], duration: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    await atomic(store.file(id), { ...base, id })
    const bindings = new ClipBindings(store)
    await assert.rejects(resolveConversationRequest({ op: 'context' }, 'nobody', bindings), /还没有绑定口播/)
    bindings.bind('chat-a', id)
    assert.equal((await resolveConversationRequest({ op: 'get' }, 'chat-a', bindings)).input.projectId, id)
    await assert.rejects(resolveConversationRequest({ op: 'get', projectId: '44444444-4444-4444-8444-444444444444' }, 'chat-a', bindings), /所属的口播/)
    const project = await store.get(id)
    bindings.quote('chat-a', project, [0, 0])
    assert.deepEqual((await resolveConversationRequest({ op: 'context' }, 'chat-a', bindings)).context.selection.indices, [0])
    bindings.unbind('chat-a')
    assert.equal(await bindings.current('chat-a'), null)
  } finally {
    await store.dispose()
    await rm(directory, { recursive: true, force: true })
  }
})
