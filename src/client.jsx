import React, { useEffect, useState } from 'react'
import { PACKAGE, SERVICE, descriptors } from './typert.js'
import css from './styles.css'
import { HypitStudio, HypitWordmark } from './client/hypit.jsx'
import { TalkingHeadStudio } from './client/talking-head.jsx'

const INJECT = ['slots', 'remote']
export const inject = INJECT

const PANEL = 'hypit-workbench'
export const VERSION = '0.14.0'
const STUDIO_KEY = 'dsh.video-workbench.studio.v1'

const STUDIOS = [
  { id: 'talking-head', label: '网感口播', hint: '文稿剪辑 · 整片制作' },
  { id: 'hypit', label: 'Hypit', hint: 'SVML 视频项目' },
]

function WorkbenchIcon({ size = 18, active = false }) {
  const w = active ? 1.75 : 1.5
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="4.25" width="14.5" height="11.5" rx="2.6" stroke="currentColor" strokeWidth={w} />
      <path d="M2.75 8h14.5" stroke="currentColor" strokeWidth={w} strokeOpacity={0.45} />
      <path d="m8.6 10 3.4 1.9-3.4 1.9z" fill="currentColor" />
    </svg>
  )
}

function StudioTabs({ studio, onChange }) {
  return (
    <div className="hw-brand">
      <span className="hw-mark" aria-hidden="true"><WorkbenchIcon size={16} active /></span>
      <span className="hw-brand-name">视频工作台</span>
      <div className="hw-studios" role="tablist" aria-label="工作区">
        {STUDIOS.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={studio === item.id}
            className={`hw-studio-tab ${studio === item.id ? 'is-on' : ''}`}
            onClick={() => onChange(item.id)}
            title={item.hint}
          >
            {item.id === 'hypit' ? <HypitWordmark /> : item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function Workbench({ api }) {
  const [studio, setStudio] = useState(() => {
    try { return globalThis.localStorage?.getItem(STUDIO_KEY) || 'talking-head' } catch { return 'talking-head' }
  })
  useEffect(() => {
    try { globalThis.localStorage?.setItem(STUDIO_KEY, studio) } catch {}
  }, [studio])
  const header = <StudioTabs studio={studio} onChange={setStudio} />
  return (
    <div className="hw-root" data-studio={studio}>
      {studio === 'hypit' ? <HypitStudio api={api} header={header} /> : <TalkingHeadStudio api={api} header={header} />}
    </div>
  )
}

function createApi(ctx) {
  async function call(input) {
    let response
    try {
      response = await ctx.remote[SERVICE].request(input)
    } catch (reason) {
      throw Object.assign(new Error(reason?.message || '连接中断，请稍后再试。'), { code: reason?.code || 'transport' })
    }
    // Service errors arrive as { ok: true, value: { error } } or { ok: false, value: { error } };
    // transport and gateway failures (timeouts, disconnects) as { ok: false, error }.
    const failure = !response?.ok ? (response?.value?.error ?? response?.error ?? {}) : response?.value?.error
    if (!response?.ok || failure) {
      const code = failure?.code || 'unavailable'
      const message = /timeout|timed out/i.test(String(failure?.message ?? code))
        ? '等待超时了。任务可能还在后台跑，稍等再看。'
        : failure?.message || '操作未完成，请稍后再试。'
      throw Object.assign(new Error(message), { code })
    }
    return response.value
  }

  /** Chat transport bound to one target ({ path } or { clip }). */
  function chatFor(ref) {
    return {
      models: () => call({ op: 'models' }),
      chat: (message, choice) => call({ op: 'chat', ...ref, message, ...(choice ?? {}) }),
      poll: (cursor, sessionId) => call({ op: 'chat-poll', ...ref, cursor, ...(sessionId ? { sessionId } : {}) }),
      list: () => call({ op: 'chat-list', ...ref }),
      open: sessionId => call({ op: 'chat-open', ...ref, sessionId }),
      remove: sessionId => call({ op: 'chat-delete', ...ref, sessionId }),
      answer: answers => call({ op: 'chat-answer', ...ref, answers }),
      stop: () => call({ op: 'chat-stop', ...ref }),
      reset: () => call({ op: 'chat-reset', ...ref }),
    }
  }

  return {
    call,
    chatFor,
    overview: roots => call({ op: 'overview', roots }),
    project: path => call({ op: 'project', path }),
    source: (path, rel) => call({ op: 'source', path, rel }),
    create: (root, name, brief) => call({ op: 'create', root, name, brief }),
    clip: (op, input = {}) => call({ ...input, op: 'th_' + op }),
  }
}

async function install(ctx) {
  const style = document.createElement('style')
  style.dataset.hypitWorkbench = 'true'
  style.textContent = css
  document.head.append(style)
  ctx.effect(() => () => style.remove())

  const unmount = await ctx.remote.$mount({ package: PACKAGE, descriptors })
  const mounted = ctx.inject(['remote.' + SERVICE], scoped => {
    const api = createApi(scoped)
    scoped.slots.inject('sidebar.panellist', () => scoped.slots.register({
      name: 'sidebar.panellist',
      id: PANEL,
      label: '视频工作台',
      order: 45,
    }, WorkbenchIcon))
    scoped.slots.inject('main', () => scoped.slots.register({
      name: 'main',
      key: PANEL,
    }, props => <Workbench api={api} {...props} />))
  })
  try {
    await mounted
  } catch (error) {
    console.error('HW_INSTALL_FAILED', error && (error.stack || error.message || String(error)))
    await mounted.dispose?.()
    await unmount?.()
    throw error
  }
  return async () => {
    await mounted.dispose?.()
    await unmount?.()
  }
}

install.inject = INJECT
export const apply = install
export default install
