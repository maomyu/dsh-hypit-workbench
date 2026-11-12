/**
 * The panel agent has no approval UI: under the host default (`workspace-write`
 * + `ask`) every escalation would fail closed. Pin its permission explicitly.
 * `full` = danger-full-access + never (no prompts); `workspace` = writes
 * confined to the project, escalations refused instead of hanging.
 */
export function grantAccess(session, access = 'full') {
  if (!session?.append) return false
  const full = access !== 'workspace'
  try {
    session.append('permission/preset', { preset: full ? 'danger-full-access' : 'workspace-write' })
    session.append('sandbox/mode', { mode: full ? 'danger-full-access' : 'workspace-write' })
    session.append('approval/policy', { policy: 'never' })
    return true
  } catch {
    return false
  }
}

/** Instructions only the panel assistant sees. */
export function panelGuide(root, kind = 'hypit') {
  return [
    '# 视频工作台面板',
    kind === 'clip'
      ? `你在「视频工作台」侧边面板里，为一条网感口播工作（工程目录 ${root}）。用户在一个窄栏里读你的回复。`
      : `你在「视频工作台」侧边面板里，为 Hypit 视频项目 ${root} 工作。用户在一个窄栏里读你的回复。`,
    '- 用中文。先给结论，再给必要细节；一般不超过 12 行，多用短列表或小表格。',
    '- 只在这个项目目录里工作。不要去看视频工作台插件自己的源码、DSH 配置或别的项目。',
    '- 需要用户拍板时调用 ask_user（面板里会出现选择卡片），选项 2–4 个，每个写清后果；拿到回答再继续，不要自己猜。',
    kind === 'clip'
      ? '- 生图张数不设上限，按画面需要生成，不用逐批征求同意；渲染整片前先说预计耗时。'
      : '- 会产生费用的 hypit build 必须先用 hypit_plan 报出请求数与费用，等用户明确同意。',
    '- 环境缺东西（Runtime Profile、模型账号、执行器）时，直接说明缺什么、用户下一步怎么做，不要反复探查。',
    '- 一轮里工具调用尽量控制在 12 次以内；做不完就先汇报进展和下一步。',
  ].join('\n')
}

/**
 * Hold an `ask_user_question` request until the panel answers it. Resolves
 * with the host's answer shape; rejects when the turn is aborted.
 */
export function askInPanel(chat, request) {
  const questions = (request?.questions ?? []).map(question => ({
    id: String(question.id ?? ''),
    question: String(question.question ?? ''),
    header: question.header ? String(question.header) : '',
    detail: question.detail ? String(question.detail) : '',
    multiSelect: question.multiSelect === true,
    options: (question.options ?? []).map(option => ({
      label: String(option.label ?? ''),
      description: option.description ? String(option.description) : '',
    })),
  }))
  return new Promise((resolve, reject) => {
    const signal = request?.signal
    const settle = fn => value => {
      if (chat.question?.token !== token) return
      chat.question = null
      signal?.removeEventListener?.('abort', onAbort)
      fn(value)
    }
    const token = Symbol('question')
    const onAbort = () => settle(reject)(signal.reason ?? new Error('aborted'))
    chat.question = { token, questions, resolve: settle(resolve), reject: settle(reject) }
    if (signal?.aborted) onAbort()
    else signal?.addEventListener?.('abort', onAbort, { once: true })
  })
}

/** Text the model receives after the panel answers (or fails to). */
export function describeAnswers(questions, result) {
  const lines = result.answers.map(answer => {
    const asked = questions.find(item => item.id === answer.id)
    const picked = answer.custom ? `自定义：${answer.custom}` : answer.selected.length ? answer.selected.join('、') : '（用户跳过）'
    return `- ${asked?.question ?? answer.id} → ${picked}`
  })
  return `用户的回答：\n${lines.join('\n')}`
}

/** Keep only answers for asked questions, in the host's answer shape. */
export function normalizeAnswers(questions, raw) {
  const given = Array.isArray(raw) ? raw : []
  return {
    answers: questions.map(question => {
      const found = given.find(item => item && item.id === question.id) ?? {}
      const labels = new Set(question.options.map(option => option.label))
      const selected = (Array.isArray(found.selected) ? found.selected : [])
        .map(String)
        .filter(label => labels.has(label))
        .slice(0, question.multiSelect ? labels.size : 1)
      const custom = typeof found.custom === 'string' ? found.custom.trim().slice(0, 2000) : ''
      return custom ? { id: question.id, selected: question.multiSelect ? selected : [], custom } : { id: question.id, selected }
    }),
  }
}

function toolDetail(name, rawArgs) {
  let args = rawArgs
  if (typeof args === 'string') {
    try { args = JSON.parse(args) } catch { return '' }
  }
  if (!args || typeof args !== 'object') return ''
  const pick = args.description ?? args.file_path ?? args.path ?? args.pattern ?? args.source ?? args.run ?? args.name ?? args.command ?? ''
  return String(pick).replace(/\s+/g, ' ').slice(0, 80)
}

/** Turn raw agent events into what the panel renders. */
export function summarizeEvents(events) {
  const messages = []
  let error = ''
  let stopped = false
  for (const event of events) {
    const data = event?.data ?? {}
    if (event?.type === 'user/message' && data.source?.kind === 'user') {
      const text = textOf(data)
      if (text) messages.push({ role: 'user', text })
    } else if (event?.type === 'assistant/message') {
      const text = textOf(data)
      if (text) messages.push({ role: 'assistant', text })
    } else if (event?.type === 'tool/call') {
      const name = typeof data.name === 'string' ? data.name : 'tool'
      messages.push({ role: 'tool', text: name, detail: toolDetail(name, data.arguments) })
    } else if (event?.type === 'turn/end' && data.reason?.kind === 'error') {
      error = data.reason.error?.message || '这一轮调用失败。'
      messages.push({ role: 'note', text: '这一轮没跑完：' + error, tone: 'error' })
    } else if (event?.type === 'turn/end' && data.reason?.kind === 'aborted') {
      stopped = true
      messages.push({ role: 'note', text: data.reason.reason?.kind === 'user' ? '已停止' : '这一轮被中断' })
    }
  }
  return { messages, error, stopped, types: [...new Set(events.map(event => event?.type).filter(Boolean))] }
}

function textOf(data) {
  if (typeof data.text === 'string' && data.text.trim()) return data.text.trim()
  const parts = Array.isArray(data.content) ? data.content
    : Array.isArray(data.message?.content) ? data.message.content
      : []
  const text = parts.filter(part => part?.type === 'text' && typeof part.text === 'string').map(part => part.text).join('\n')
  return text.trim()
}
