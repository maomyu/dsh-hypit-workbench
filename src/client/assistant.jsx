import React, { useCallback, useEffect, useRef, useState } from 'react'
import { messageFor } from '../view.js'
import { Icon, Markdown, pad, useDismiss } from './shared.jsx'
import { openModelSettings } from './keys.js'

const CHOICE_KEY = 'dsh.hypit-workbench.model.v1'
const ACCESS = [
  { id: 'full', label: '完全访问', body: '可读写本机文件、运行命令，不再逐条确认。适合让它直接动手。' },
  { id: 'workspace', label: '仅限项目', body: '只能改这个项目目录；越界的操作会直接被拒，不会卡住等你确认。' },
]
const EFFORTS = [
  { id: '', label: '默认' },
  { id: 'low', label: '低' },
  { id: 'medium', label: '中' },
  { id: 'high', label: '高' },
]


function loadChoice() {
  try {
    const raw = globalThis.localStorage?.getItem(CHOICE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
}

function saveChoice(choice) {
  try { globalThis.localStorage?.setItem(CHOICE_KEY, JSON.stringify(choice)) } catch {}
}

/* ── 助手 ─────────────────────────────────────────── */

function groupTurns(turns) {
  const out = []
  for (const turn of turns) {
    const last = out[out.length - 1]
    if (turn.role === 'tool') {
      if (last?.role === 'tools') last.items.push(turn)
      else out.push({ role: 'tools', items: [turn] })
    } else {
      out.push(turn)
    }
  }
  return out
}

function ToolTrail({ items, live }) {
  const [open, setOpen] = useState(false)
  const tally = []
  for (const item of items) {
    const found = tally.find(entry => entry.name === item.text)
    if (found) found.count += 1
    else tally.push({ name: item.text, count: 1 })
  }
  const last = items[items.length - 1]
  return (
    <div className={`hw-trail ${live ? 'is-live' : ''}`}>
      <button type="button" className="hw-trail-head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <Icon name="tool" size={12} />
        <span className="hw-trail-lead">{live ? '正在用工具' : `用了 ${items.length} 次工具`}</span>
        {tally.slice(0, 4).map(entry => (
          <span key={entry.name} className="hw-trail-chip">{entry.name}{entry.count > 1 ? <em>×{entry.count}</em> : null}</span>
        ))}
        {tally.length > 4 ? <span className="hw-trail-chip">+{tally.length - 4}</span> : null}
        <Icon name="chevronDown" size={11} />
      </button>
      {live && last?.detail && !open ? <p className="hw-trail-now">{last.text} · {last.detail}</p> : null}
      {open ? (
        <ol className="hw-trail-list">
          {items.map((item, index) => (
            <li key={index}><b>{item.text}</b>{item.detail ? <span>{item.detail}</span> : null}</li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

function QuestionCard({ question, onAnswer }) {
  const [picked, setPicked] = useState({})
  const [custom, setCustom] = useState({})
  const [sending, setSending] = useState(false)
  const items = question.questions ?? []
  const ready = items.every(item => (picked[item.id]?.length ?? 0) > 0 || (custom[item.id] ?? '').trim())

  function toggle(item, label) {
    setPicked(previous => {
      const current = previous[item.id] ?? []
      const next = item.multiSelect
        ? (current.includes(label) ? current.filter(entry => entry !== label) : [...current, label])
        : [label]
      return { ...previous, [item.id]: next }
    })
    if (!item.multiSelect) setCustom(previous => ({ ...previous, [item.id]: '' }))
  }

  async function submit(skip = false) {
    setSending(true)
    const answers = items.map(item => skip ? { id: item.id, selected: [] } : {
      id: item.id,
      selected: picked[item.id] ?? [],
      ...((custom[item.id] ?? '').trim() ? { custom: custom[item.id].trim() } : {}),
    })
    try { await onAnswer(answers) } finally { setSending(false) }
  }

  return (
    <div className="hw-question" role="group" aria-label="助手在问你">
      <p className="hw-question-kicker"><span className="hw-next-rec" aria-hidden="true" />等你决定</p>
      {items.map(item => (
        <div key={item.id} className="hw-question-item">
          {item.header ? <span className="hw-question-header">{item.header}</span> : null}
          <b>{item.question}</b>
          {item.detail ? <p className="hw-question-detail">{item.detail}</p> : null}
          <div className="hw-question-options">
            {(item.options ?? []).map(option => {
              const on = (picked[item.id] ?? []).includes(option.label)
              return (
                <button
                  key={option.label}
                  type="button"
                  className={`hw-option ${on ? 'is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggle(item, option.label)}
                >
                  <span className={`hw-option-mark ${item.multiSelect ? 'is-check' : ''}`} aria-hidden="true">{on ? <Icon name="check" size={10} stroke={2.4} /> : null}</span>
                  <span>
                    <b>{option.label}</b>
                    {option.description ? <span>{option.description}</span> : null}
                  </span>
                </button>
              )
            })}
          </div>
          <input
            className="hw-question-custom"
            value={custom[item.id] ?? ''}
            onChange={event => {
              const value = event.target.value
              setCustom(previous => ({ ...previous, [item.id]: value }))
              if (value && !item.multiSelect) setPicked(previous => ({ ...previous, [item.id]: [] }))
            }}
            placeholder="或者直接写你的想法"
          />
        </div>
      ))}
      <div className="hw-question-foot">
        <button type="button" className="hw-text-btn" disabled={sending} onClick={() => submit(true)}>跳过</button>
        <button type="button" className="hw-cta is-small" disabled={!ready || sending} onClick={() => submit(false)}>
          {sending ? <span className="hw-spinner is-light" aria-hidden="true" /> : null}
          回答
        </button>
      </div>
    </div>
  )
}

function AccessMenu({ access, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))
  const current = ACCESS.find(item => item.id === access) ?? ACCESS[0]
  return (
    <div className="hw-access" ref={ref}>
      <button
        type="button"
        className={`hw-access-btn is-${current.id}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <Icon name={current.id === 'full' ? 'shieldOk' : 'shield'} size={13} />
        {current.label}
        <Icon name="chevronDown" size={11} />
      </button>
      {open ? (
        <div className="hw-pop hw-pop-access" role="dialog" aria-label="助手权限">
          <p className="hw-pop-title">助手权限</p>
          <div className="hw-access-list" role="radiogroup" aria-label="助手权限">
            {ACCESS.map(item => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={item.id === current.id}
                className={`hw-access-item ${item.id === current.id ? 'is-on' : ''}`}
                onClick={() => { onChange(item.id); setOpen(false) }}
              >
                <span className="hw-radio" aria-hidden="true" />
                <span>
                  <b>{item.label}</b>
                  <span>{item.body}</span>
                </span>
              </button>
            ))}
          </div>
          <p className="hw-pop-foot-note">不会弹确认框：面板里没有审批入口，所以这里直接决定它能做什么。</p>
        </div>
      ) : null}
    </div>
  )
}

/* ── 对话记录 ─────────────────────────────────────── */

function when(ts, now = Date.now()) {
  if (!ts) return ''
  const minutes = Math.round((now - ts) / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const date = new Date(ts)
  const today = new Date(now)
  const sameDay = date.toDateString() === today.toDateString()
  const yesterday = new Date(now - 86400000).toDateString() === date.toDateString()
  const hm = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  if (sameDay) return `今天 ${hm}`
  if (yesterday) return `昨天 ${hm}`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function Conversations({ list, current, busy, onOpen, onNew, onRemove, title }) {
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState('')
  const ref = useRef(null)
  const listRef = useRef(null)
  useDismiss(ref, open, () => { setOpen(false); setConfirm('') })
  const active = list.find(item => item.sessionId === current)
  const label = active ? active.title : '新对话'
  const count = list.length

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => listRef.current?.querySelector('[aria-current="true"], .hw-convo-item')?.focus())
  }, [open])

  function onKey(event) {
    if (event.key === 'Escape') { setOpen(false); return }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const items = [...(listRef.current?.querySelectorAll('.hw-convo-item') ?? [])]
    const index = items.indexOf(document.activeElement)
    items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <div className="hw-convo" ref={ref}>
      <button
        type="button"
        className={`hw-convo-btn ${open ? 'is-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        title={`${title} 的对话记录`}
      >
        <span className="hw-convo-label">{label}</span>
        {count > (active ? 1 : 0) ? <span className="hw-convo-count" title={`这个项目共 ${count} 段对话`}>{count}</span> : null}
        <Icon name="chevronDown" size={11} />
      </button>
      {open ? (
        <div className="hw-pop hw-pop-convo" role="dialog" aria-label="对话记录" onKeyDown={onKey}>
          <div className="hw-convo-head">
            <p className="hw-pop-title">{title} · 对话记录</p>
            <button type="button" className="hw-convo-new" disabled={busy} onClick={() => { setOpen(false); onNew() }}>
              <Icon name="plus" size={12} />新对话
            </button>
          </div>
          {count ? (
            <ol className="hw-convo-list" ref={listRef}>
              {list.map((item, index) => {
                const on = item.sessionId === current
                return (
                  <li key={item.sessionId} className={`hw-convo-row ${on ? 'is-on' : ''}`} style={{ '--i': index }}>
                    <button
                      type="button"
                      className="hw-convo-item"
                      aria-current={on ? 'true' : undefined}
                      disabled={busy && !on}
                      onClick={() => { setOpen(false); if (!on) onOpen(item.sessionId) }}
                    >
                      <span className="hw-convo-index">{pad(count - index)}</span>
                      <span className="hw-convo-main">
                        <b>{item.title}</b>
                        <span>
                          {item.running ? <em className="hw-convo-live"><i aria-hidden="true" />进行中</em> : when(item.updatedAt)}
                          {item.turns ? ` · ${item.turns} 轮` : ''}
                        </span>
                      </span>
                    </button>
                    {!on ? (
                      <button
                        type="button"
                        className={`hw-convo-del ${confirm === item.sessionId ? 'is-confirm' : ''}`}
                        onClick={() => {
                          if (confirm !== item.sessionId) { setConfirm(item.sessionId); return }
                          setConfirm('')
                          onRemove(item.sessionId)
                        }}
                        onBlur={() => setConfirm(current => current === item.sessionId ? '' : current)}
                        aria-label={confirm === item.sessionId ? '再点一次移出列表' : '移出列表'}
                        title={confirm === item.sessionId ? '再点一次移出列表' : '移出列表'}
                      >
                        {confirm === item.sessionId ? '移出' : <Icon name="x" size={11} />}
                      </button>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          ) : (
            <p className="hw-convo-empty">这里会按时间列出这个项目的每一段对话，重开工作台也能接着聊。</p>
          )}
          <p className="hw-pop-foot-note">每个项目各自保存；移出列表不会删除会话文件。</p>
        </div>
      ) : null}
    </div>
  )
}

/** Hide the machine-readable context block we prepend to quoted messages. */
function stripContext(text) {
  return String(text ?? '').replace(/^【引用原句】[\s\S]*?\n\n/u, '')
}

/**
 * Panel conversation bound to one target.
 * target: { id, title, hint, kicker, heading, body, prompts[], ref } where
 * `ref` is the RPC target ({ path } for Hypit, { clip } for 网感口播).
 * chat: { chat, poll, answer, stop, reset, models } transport.
 */
export function Assistant({ target, chat: api, pendingPrompt, onConsume, onTurnDone, attachment, onClearAttachment, className = '' }) {
  const detail = { id: target.id, title: target.title, root: target.hint }
  const [turns, setTurns] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [startedAt, setStartedAt] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState(null)
  const [choice, setChoice] = useState(loadChoice)
  const [catalog, setCatalog] = useState(null)
  const [menu, setMenu] = useState(false)
  const [primed, setPrimed] = useState(false)
  const [question, setQuestion] = useState(null)
  const [stopping, setStopping] = useState(false)
  const [conversations, setConversations] = useState([])
  const [current, setCurrent] = useState('')
  const [loading, setLoading] = useState(true)
  const cursorRef = useRef(0)
  const lastTextRef = useRef('')
  const logRef = useRef(null)
  const inputRef = useRef(null)
  const menuRef = useRef(null)
  useDismiss(menuRef, menu, () => setMenu(false))

  useEffect(() => {
    let alive = true
    api.models()
      .then(result => {
        if (!alive) return
        setCatalog(result)
        setChoice(previous => {
          const next = { ...previous }
          if (!next.provider) next.provider = result?.selection?.provider ?? ''
          if (!next.model) next.model = result?.selection?.model ?? ''
          saveChoice(next)
          return next
        })
      })
      .catch(() => {})
    return () => { alive = false }
  }, [api])

  useEffect(() => {
    if (!pendingPrompt) return undefined
    if (pendingPrompt.for && pendingPrompt.for !== detail.id) return undefined
    const text = pendingPrompt.text ?? ''
    if (text) setDraft(text)
    setPrimed(true)
    const node = inputRef.current
    node?.focus()
    const end = (text || node?.value || '').length
    node?.setSelectionRange?.(end, end)
    onConsume?.()
    const timer = setTimeout(() => setPrimed(false), 900)
    return () => clearTimeout(timer)
  }, [pendingPrompt, onConsume, detail.id])

  // Follow new output only while the reader is at the bottom; once they
  // scroll up to read, leave them there and offer a jump-to-latest button.
  const pinnedRef = useRef(true)
  const [unseen, setUnseen] = useState(false)
  const onLogScroll = useCallback(event => {
    const node = event.currentTarget
    const pinned = node.scrollHeight - node.scrollTop - node.clientHeight < 48
    pinnedRef.current = pinned
    if (pinned) setUnseen(false)
  }, [])
  const jumpToLatest = useCallback(() => {
    const node = logRef.current
    if (!node) return
    pinnedRef.current = true
    setUnseen(false)
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [])
  useEffect(() => {
    const node = logRef.current
    if (!node) return
    if (pinnedRef.current) node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
    else setUnseen(true)
  }, [turns, busy, error, question])

  const refreshList = useCallback(async () => {
    if (!api.list) return null
    try {
      const result = await api.list()
      setConversations(result?.conversations ?? [])
      return result
    } catch { return null }
  }, [api])

  /** Show a conversation: the live one, or its transcript read from disk. */
  const show = useCallback(async (sessionId, { open = false } = {}) => {
    setLoading(true)
    setError(null)
    setQuestion(null)
    try {
      const result = open && sessionId ? await api.open(sessionId) : await api.poll(0, sessionId || undefined)
      if (!result?.exists) {
        setTurns([])
        cursorRef.current = 0
        setCurrent('')
        setBusy(false)
        return
      }
      setTurns(result.messages ?? [])
      cursorRef.current = result.cursor ?? 0
      setCurrent(result.sessionId || sessionId || '')
      if (result.running) {
        setBusy(true)
        setStartedAt(result.startedAt || Date.now())
        setQuestion(result.question)
      } else {
        setBusy(false)
      }
      pinnedRef.current = true
    } catch (reason) {
      setError({ text: messageFor(reason), retry: '' })
    } finally {
      setLoading(false)
    }
  }, [api])

  // Entering a project: list its conversations and reopen the latest one.
  useEffect(() => {
    let alive = true
    setTurns([])
    setCurrent('')
    cursorRef.current = 0
    ;(async () => {
      const listed = await refreshList()
      if (!alive) return
      await show(listed?.current || '')
    })()
    return () => { alive = false }
  }, [api, detail.id, refreshList, show])

  // While a turn runs, stream progress by polling the host.
  useEffect(() => {
    if (!busy) return undefined
    let alive = true
    let timer = 0
    let failures = 0
    async function tick() {
      try {
        const result = await api.poll(cursorRef.current)
        if (!alive) return
        failures = 0
        const fresh = (result.messages ?? []).filter(item => item.role !== 'user' && !(item.role === 'note' && item.tone === 'error'))
        if (fresh.length) setTurns(previous => [...previous, ...fresh])
        cursorRef.current = result.cursor ?? cursorRef.current
        setQuestion(result.question ?? null)
        if (!result.running) {
          setBusy(false)
          setStopping(false)
          const replied = fresh.some(item => item.role === 'assistant')
          if (result.error) setError({ text: result.error, retry: lastTextRef.current })
          else if (!replied && !result.stopped && !fresh.length) setError({ text: '这一轮没有文字返回。可能是模型没配好，或调用被中断。', retry: lastTextRef.current })
          onTurnDone?.()
          void refreshList()
          return
        }
      } catch (reason) {
        failures += 1
        if (failures >= 6) {
          if (!alive) return
          setBusy(false)
          setError({ text: messageFor(reason), retry: lastTextRef.current })
          return
        }
      }
      if (alive) timer = setTimeout(tick, 900)
    }
    timer = setTimeout(tick, 600)
    return () => { alive = false; clearTimeout(timer) }
  }, [busy, api, detail.id, onTurnDone, refreshList])

  useEffect(() => {
    const node = inputRef.current
    if (!node) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 168)}px`
  }, [draft])

  useEffect(() => {
    if (!busy) return undefined
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500)
    return () => clearInterval(timer)
  }, [busy, startedAt])

  function update(patch) {
    setChoice(previous => {
      const next = { ...previous, ...patch }
      saveChoice(next)
      return next
    })
  }

  const provider = catalog?.providers?.find(item => item.id === (choice.provider || catalog?.selection?.provider))
  const models = provider?.models ?? []
  const modelId = choice.model || catalog?.selection?.model || ''
  const modelLabel = models.find(item => item.id === modelId)?.label || modelId || '模型'
  // Pill shows the distinguishing tail ("V4.1-Flash"), the menu shows the full name.
  const modelShort = modelLabel.replace(/^(deepseek|claude|gpt|gemini|qwen)[-\s]?/iu, '') || modelLabel
  const access = choice.access === 'workspace' ? 'workspace' : 'full'

  const [sending, setSending] = useState(false)

  async function send(override) {
    const typed = String(override ?? draft).trim()
    if (!typed || busy || sending) return
    const text = attachment?.context ? `${attachment.context}\n\n${typed}` : typed
    setSending(true)
    setError(null)
    if (override === undefined) setDraft('')
    lastTextRef.current = text
    pinnedRef.current = true
    setTurns(previous => [...previous, { role: 'user', text: typed, quote: attachment?.label }])
    try {
      const result = await api.chat(text, {
        provider: choice.provider || undefined,
        model: choice.model || undefined,
        reasoningEffort: choice.reasoningEffort || undefined,
        access,
        ...(current ? { sessionId: current } : {}),
      })
      cursorRef.current = result?.cursor ?? cursorRef.current
      if (result?.sessionId) setCurrent(result.sessionId)
      void refreshList()
      if (attachment) onClearAttachment?.()
      setStartedAt(Date.now())
      setElapsed(0)
      setBusy(true)
    } catch (reason) {
      setError({ text: messageFor(reason), retry: text })
      if (override === undefined) setDraft(typed)
    } finally {
      setSending(false)
    }
  }

  async function stop() {
    setStopping(true)
    try { await api.stop() } catch (reason) { setStopping(false); setError({ text: messageFor(reason), retry: lastTextRef.current }) }
  }

  async function answer(answers) {
    try {
      await api.answer(answers)
      setQuestion(null)
    } catch (reason) {
      setError({ text: messageFor(reason), retry: lastTextRef.current })
    }
  }

  async function startNew() {
    if (busy) return
    try { await api.reset() } catch (reason) { setError({ text: messageFor(reason), retry: '' }); return }
    setTurns([])
    setError(null)
    setQuestion(null)
    setCurrent('')
    cursorRef.current = 0
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  async function openConversation(sessionId) {
    if (busy) return
    await show(sessionId, { open: true })
    void refreshList()
  }

  async function removeConversation(sessionId) {
    try {
      await api.remove(sessionId)
      await refreshList()
    } catch (reason) {
      setError({ text: messageFor(reason), retry: '' })
    }
  }

  const prompts = target.prompts ?? []
  const grouped = groupTurns(turns)

  return (
    <aside className={`hw-assistant ${className}`} aria-label="助手">
      <div className="hw-assistant-head">
        <div className="hw-assistant-title">
          <span className={`hw-live ${busy ? 'is-busy' : ''}`} aria-hidden="true" />
          <Conversations
            list={conversations}
            current={current}
            busy={busy || sending}
            title={detail.title}
            onOpen={openConversation}
            onNew={startNew}
            onRemove={removeConversation}
          />
        </div>
        <div className="hw-assistant-tools" ref={menuRef}>
          <button className={`hw-pill-btn is-quiet ${menu ? 'is-open' : ''}`} type="button" aria-expanded={menu} onClick={() => setMenu(value => !value)} title="对话模型">
            <span className="hw-model-name">{modelShort}</span>
            <Icon name="chevronDown" size={11} />
          </button>
          {turns.length && !busy ? (
            <button className="hw-icon-btn" type="button" onClick={startNew} aria-label="新对话" title="新对话（上一段会保存在对话记录里）">
              <Icon name="plus" size={14} />
            </button>
          ) : null}
          {menu ? (
            <div className="hw-pop hw-pop-settings" role="dialog" aria-label="对话模型">
              <p className="hw-pop-title">对话模型</p>
              {models.length > 1 ? (
                <div className="hw-model-list" role="radiogroup" aria-label="模型">
                  {models.map(item => (
                    <button
                      key={item.id}
                      type="button"
                      role="radio"
                      aria-checked={item.id === modelId}
                      className={`hw-model-row ${item.id === modelId ? 'is-on' : ''}`}
                      onClick={() => update({ provider: provider?.id ?? choice.provider, model: item.id })}
                    >
                      <span className="hw-radio" aria-hidden="true" />
                      <span>{item.label || item.id}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="hw-model-current">{modelLabel}<span>{provider?.name ?? ''}</span></p>
              )}
              <div className="hw-field">
                <span>思考深度</span>
                <div className="hw-seg" role="radiogroup" aria-label="思考深度">
                  {EFFORTS.map(item => (
                    <button
                      key={item.id || 'default'}
                      type="button"
                      role="radio"
                      aria-checked={(choice.reasoningEffort ?? '') === item.id}
                      className={(choice.reasoningEffort ?? '') === item.id ? 'is-on' : ''}
                      onClick={() => update({ reasoningEffort: item.id })}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className="hw-pop-link" onClick={() => { setMenu(false); openModelSettings() }}>
                <Icon name="gear" size={12} />
                添加或管理模型（设置 → 模型）
                <Icon name="arrow" size={12} />
              </button>
              <p className="hw-pop-foot-note">换模型后，这段对话照常继续。</p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="hw-chat-log" role="log" aria-live="polite" ref={logRef} onScroll={onLogScroll} tabIndex={0}>
        {loading && turns.length === 0 ? (
          <div className="hw-chat-skeleton" aria-hidden="true"><i /><i /><i /></div>
        ) : turns.length === 0 ? (
          <div className="hw-intro">
            <p className="hw-intro-kicker">{target.kicker ?? `只为 ${detail.title} 工作`}</p>
            <h3>{target.heading ?? '说一句，它就动手。'}</h3>
            <p className="hw-intro-body">{target.body}</p>
            <div className="hw-prompts">
              {prompts.map((prompt, index) => (
                <button key={prompt} type="button" className="hw-prompt" style={{ '--i': index }} onClick={() => send(prompt)}>
                  <span className="hw-prompt-n">{pad(index + 1)}</span>
                  <span className="hw-prompt-text">{prompt}</span>
                  <Icon name="arrow" size={13} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          grouped.map((turn, index) => (
            turn.role === 'tools' ? <ToolTrail key={index} items={turn.items} live={busy && index === grouped.length - 1} />
              : turn.role === 'note' ? <p key={index} className={`hw-turn-note ${turn.tone === 'error' ? 'is-error' : ''}`}>{turn.text}</p>
              : turn.role === 'user' ? (
                <div key={index} className="hw-turn hw-turn-user">
                  <div className="hw-bubble">
                    {turn.quote ? <span className="hw-bubble-quote"><Icon name="quote" size={11} />{turn.quote}</span> : null}
                    {stripContext(turn.text)}
                  </div>
                </div>
              ) : (
                <div key={index} className="hw-turn hw-turn-assistant">
                  <div className="hw-turn-body hw-turn-md"><Markdown text={turn.text} /></div>
                </div>
              )
          ))
        )}
        {question ? <QuestionCard key={JSON.stringify(question.questions?.map(item => item.id))} question={question} onAnswer={answer} /> : null}
        {(busy || sending) && !question ? (
          <div className="hw-thinking" role="status">
            <span className="hw-dots" aria-hidden="true"><i /><i /><i /></span>
            <span>{stopping ? '正在停止' : sending ? '正在发送' : '正在处理'}</span>
            {busy ? <span className="hw-mono">{elapsed}s</span> : null}
            {busy && !stopping ? (
              <button type="button" className="hw-stop" onClick={stop}>
                <span aria-hidden="true" />
                停止
              </button>
            ) : null}
          </div>
        ) : null}
        {error && !busy ? (
          <div className="hw-error-card" role="alert">
            <b>这一轮没跑完</b>
            <p>{error.text}</p>
            {error.retry ? (
              <button className="hw-text-btn is-strong" type="button" onClick={() => send(error.retry)}>
                <Icon name="retry" size={13} />
                重试
              </button>
            ) : null}
            {/model|模型/iu.test(error.text) ? (
              <button className="hw-text-btn" type="button" onClick={() => openModelSettings()}>
                去「设置 → 模型」<Icon name="arrow" size={12} />
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {unseen ? (
        <button type="button" className="hw-jump" onClick={jumpToLatest}>
          <Icon name="chevronDown" size={12} />
          {busy ? '有新进展' : '回到最新'}
        </button>
      ) : null}
      <div className={`hw-compose ${primed ? 'is-primed' : ''}`}>
        {attachment ? (
          <div className="hw-attach">
            <Icon name="quote" size={13} />
            <span className="hw-attach-text">{attachment.label}</span>
            <button type="button" className="hw-icon-btn is-tiny" onClick={onClearAttachment} aria-label="移除引用">
              <Icon name="x" size={11} />
            </button>
          </div>
        ) : null}
        <textarea
          ref={inputRef}
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault()
              void send()
            }
          }}
          placeholder={question ? '先回答上面的问题…' : busy ? '它在干活，可以先写下一句…' : '要它做什么？'}
          rows={2}
          aria-label="和助手说话"
        />
        <div className="hw-compose-bar">
          <AccessMenu access={access} onChange={value => update({ access: value })} />
          <span className="hw-compose-hint">↩ 发送 · ⇧↩ 换行</span>
          {busy ? (
            <button className="hw-send is-stop" type="button" onClick={stop} disabled={stopping} aria-label="停止这一轮" title="停止">
              <span className="hw-send-stop" aria-hidden="true" />
            </button>
          ) : (
            <button className="hw-send" type="button" disabled={sending || !draft.trim()} onClick={() => send()} aria-label="发送">
              {sending ? <span className="hw-spinner is-light" aria-hidden="true" /> : <Icon name="send" size={15} />}
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
