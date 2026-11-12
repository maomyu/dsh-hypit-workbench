/**
 * Talking-head project selection for agent tools.
 *
 * The old plugin bound each clip to a native host session and monkey-patched
 * host UI to keep those sessions hidden. The workbench owns its own private
 * panel agents instead, so binding is simple: a panel chat is created for one
 * clip and remembers that clip's id. Tool calls from that chat resolve the
 * clip from here; nothing touches host session lists.
 */
import { projectCommands } from './commands.js'
import { useSelectedStyle } from './art-styles.js'

export class ClipBindings {
  constructor(store) {
    this.store = store
    this.bySession = new Map()
    this.selection = new Map()
  }

  bind(sessionId, projectId) {
    if (typeof sessionId !== 'string' || !sessionId) throw new Error('无效对话')
    this.bySession.set(sessionId, projectId)
  }

  unbind(sessionId) {
    this.bySession.delete(sessionId)
    this.selection.delete(sessionId)
  }

  async current(sessionId) {
    const id = this.bySession.get(sessionId)
    if (!id) return null
    try { return await this.store.get(id) } catch (error) { if (error.code === 'ENOENT') return null; throw error }
  }

  quote(sessionId, project, indices) {
    if (!Array.isArray(indices) || indices.some(index => !Number.isInteger(index) || !project.transcript[index])) {
      throw new Error('请重新选择有效的原句')
    }
    const selection = { revision: project.revision, indices: [...new Set(indices)].sort((a, b) => a - b) }
    this.selection.set(sessionId, { projectId: project.id, ...selection })
    return selection
  }

  selectionFor(sessionId, project) {
    const saved = this.selection.get(sessionId)
    if (!saved || saved.projectId !== project.id || saved.revision !== project.revision) return null
    return { ...saved, lines: saved.indices.map(index => ({ index, ...project.transcript[index] })) }
  }
}

const IMAGE_OPS = new Set(['images_list', 'generate_images', 'image_preview', 'image_media', 'image_use'])
const PROJECT_OPS = new Set(['get', 'job', 'cancel', 'edit', 'transcript', 'render', 'read_file', 'write_file', 'studio', 'adopt', 'transcribe', 'status', 'art_style', ...IMAGE_OPS])

/** Fill projectId from the calling chat and enforce the chosen art style on init. */
export async function resolveClipRequest(input, sessionId, bindings) {
  const bound = sessionId ? await bindings.current(sessionId) : null
  if (input.projectId && bound && input.projectId !== bound.id) throw new Error('这条对话只能操作它所属的口播')
  if (input.op === 'context') {
    if (!bound) throw new Error('这条对话还没有绑定口播，请在视频工作台里选中一条口播再说。')
    return { context: { project: bound, selection: bindings.selectionFor(sessionId, bound) } }
  }
  if (!input.projectId && PROJECT_OPS.has(input.op) && (input.op !== 'studio' || projectCommands.has(input.command))) {
    if (!bound) throw new Error('这条对话没有绑定口播')
    return { input: useSelectedStyle({ ...input, projectId: bound.id }, bound) }
  }
  if (input.op === 'studio' && input.command === 'init' && input.projectId) {
    return { input: useSelectedStyle(input, await bindings.store.get(input.projectId)) }
  }
  return { input }
}
