import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatBytes, formatTime, messageFor, shortPath, splitRoots } from '../view.js'
import logoOnLight from '../assets/hypit-logo-on-light.svg'
import logoOnDark from '../assets/hypit-logo-on-dark.svg'
import { Icon, Markdown, Toast, copyText, pad, splitRel, useCopy, useDismiss } from './shared.jsx'
import { Assistant } from './assistant.jsx'
import { FilmCard, FilmPlayer, clipTime } from './talking-head.jsx'

const ROOTS_KEY = 'dsh.hypit-workbench.roots.v1'

const STAGES = [
  { key: 'write', label: '脚本' },
  { key: 'check', label: '检查' },
  { key: 'render', label: '出片' },
  { key: 'review', label: '成片' },
]

function stageKeyOf(counts = {}) {
  if (!counts.source) return 'write'
  if (!counts.run) return 'check'
  if (!counts.result) return 'render'
  return 'review'
}

export function HypitWordmark() {
  return (
    <>
      <img className="hw-logo-on-light" src={logoOnLight} alt="Hypit" />
      <img className="hw-logo-on-dark" src={logoOnDark} alt="Hypit" />
    </>
  )
}

function loadRoots() {
  try {
    const raw = globalThis.localStorage?.getItem(ROOTS_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length) return parsed
  } catch {}
  return ['~/Hypit']
}

function saveRoots(roots) {
  try { globalThis.localStorage?.setItem(ROOTS_KEY, JSON.stringify(roots)) } catch {}
}

function stageIndex(key) {
  return Math.max(0, STAGES.findIndex(item => item.key === key))
}

function stageOf(detail) {
  const counts = detail?.counts ?? {}
  if (!counts.source) {
    return {
      key: 'write',
      title: '这个项目还没有脚本',
      body: '先写一条最小可跑的 SVML，再去检查。助手知道这个项目的位置和结构。',
      cta: '帮我写第一版脚本',
      alt: { label: '先看看项目结构', prompt: '先读一遍这个项目的目录和 package.json，告诉我现在有什么、缺什么。' },
      prompt: '先看这个项目的 package.json 和已有文件，写一条最小可跑的 SVML Source，写进项目里。',
    }
  }
  if (!counts.run) {
    return {
      key: 'check',
      title: '脚本有了，还没检查',
      body: '先跑一次 check，把问题一次问清楚，再决定要不要出片。',
      cta: '检查这份脚本',
      alt: { label: '补一条 Run', prompt: '给这个项目补一条最小可用的 .svrun，并说明每一行在做什么。' },
      prompt: '先 check 这个项目的 Source，把报错逐条解释清楚，并直接修掉能修的。',
    }
  }
  if (!counts.result) {
    return {
      key: 'render',
      title: '可以出片了',
      body: '按现有 Run 出一版。先问清楚大概花多少、要多久，再决定。',
      cta: '出一版看看',
      alt: { label: '先检查一遍', prompt: '先 check 这个项目的 Source，把报错逐条解释清楚，并直接修掉能修的。' },
      prompt: '按现有 Run 出第一版，先告诉我大概花多少、要多久，我确认后再跑。',
    }
  }
  return {
    key: 'review',
    title: '这一版已经出片',
    body: '去成片里看结果，不满意就在这里说清楚要改哪一段、改成什么。',
    cta: '看成片',
    tab: 'results',
    alt: { label: '让助手点评', prompt: '看看这一版成片，告诉我哪里还需要改，按优先级列出来。' },
  }
}

/* ── 顶栏 ─────────────────────────────────────────── */

function EnvPopover({ data }) {
  const executor = data?.executor ?? {}
  const skill = data?.skill ?? {}
  const node = data?.node ?? {}
  const [copied, copy] = useCopy()
  const rows = [
    { label: '执行器', ok: executor.found, value: executor.version || (executor.found ? '已找到' : '未安装'), fix: executor.found ? '' : 'npm i -g @hypit/hypit --registry=https://registry.npmjs.org' },
    { label: 'Hypit 技能', ok: skill.found, value: skill.found ? '已安装' : '未找到', fix: skill.found ? '' : 'npx skills add hypit-ai/hypit -g --agent universal -y' },
    { label: 'Node', ok: Boolean(node.version), value: node.version ? `v${node.version}` : '—' },
    { label: '对话工具', ok: (data?.tools ?? []).length > 0, value: `${(data?.tools ?? []).length} 个` },
  ]
  return (
    <div className="hw-pop hw-pop-env" role="dialog" aria-label="本机环境">
      <p className="hw-pop-title">本机环境</p>
      {rows.map(row => (
        <div className="hw-env-row" key={row.label}>
          <span className={`hw-env-mark ${row.ok ? 'is-ok' : 'is-warn'}`} aria-hidden="true" />
          <span className="hw-env-label">{row.label}</span>
          <b>{row.value}</b>
          {row.fix ? (
            <button type="button" className="hw-env-fix" onClick={() => copy(row.fix)}>
              <code>{row.fix}</code>
              <span>{copied === row.fix ? '已复制' : '复制'}</span>
            </button>
          ) : null}
        </div>
      ))}
      <div className="hw-pop-rule" />
      {(data?.roots ?? []).map(root => (
        <div className="hw-env-row is-root" key={root.path}>
          <span className={`hw-env-mark ${root.ok ? 'is-ok' : 'is-warn'}`} aria-hidden="true" />
          <span className="hw-env-label" title={root.path}>{shortPath(root.path, 22)}</span>
          <b>{root.ok ? `${(root.projects ?? []).length} 个项目` : '不可读'}</b>
        </div>
      ))}
      <p className="hw-pop-foot-note">Hypit · 只读扫描</p>
    </div>
  )
}

function ProjectSwitch({ projects, selected, onSelect, onCreate }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))
  const index = Math.max(0, projects.findIndex(item => item.id === selected))
  const current = projects[index]
  const list = useMemo(() => {
    const text = query.trim().toLowerCase()
    return projects
      .map((project, position) => ({ project, position }))
      .filter(({ project }) => !text || `${project.title} ${project.root}`.toLowerCase().includes(text))
  }, [projects, query])

  return (
    <div className="hw-switch" ref={ref}>
      <span className="hw-switch-slash" aria-hidden="true">/</span>
      <button
        type="button"
        className={`hw-switch-btn ${open ? 'is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
      >
        <span className={`hw-dot is-${stageKeyOf(current?.counts)}`} aria-hidden="true" />
        <span className="hw-switch-name">{current?.title ?? '选择项目'}</span>
        <span className="hw-switch-count">{pad(index + 1)}/{pad(projects.length)}</span>
        <Icon name="chevronDown" size={12} />
      </button>
      {open ? (
        <div className="hw-pop hw-switch-pop" role="dialog" aria-label="切换项目">
          {projects.length > 5 ? (
            <label className="hw-search">
              <Icon name="search" size={13} />
              <input autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索项目" aria-label="搜索项目" />
            </label>
          ) : (
            <p className="hw-pop-title">项目 · {pad(projects.length)}</p>
          )}
          <ul className="hw-switch-list" role="listbox" aria-label="项目">
            {list.map(({ project, position }) => {
              const on = project.id === selected
              const key = stageKeyOf(project.counts)
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    className={`hw-switch-item ${on ? 'is-on' : ''}`}
                    onClick={() => { onSelect(project.id); setOpen(false); setQuery('') }}
                  >
                    <span className="hw-switch-index">{pad(position + 1)}</span>
                    <span className="hw-switch-main">
                      <b>{project.title}</b>
                      <span>{shortPath(project.root, 34)}</span>
                    </span>
                    <span className={`hw-tag is-${key}`}>{STAGES.find(item => item.key === key)?.label}</span>
                  </button>
                </li>
              )
            })}
            {!list.length ? <li className="hw-switch-empty">没有匹配的项目</li> : null}
          </ul>
          <button type="button" className="hw-switch-new" onClick={() => { setOpen(false); setQuery(''); onCreate() }}>
            <span className="hw-switch-new-icon"><Icon name="plus" size={13} stroke={2} /></span>
            新建项目
            <kbd>N</kbd>
          </button>
        </div>
      ) : null}
    </div>
  )
}

function TopBar({ header, data, loading, rootsText, setRootsText, onScan, projects, selected, onSelect, rootsOpen, setRootsOpen, onCreate }) {
  const [env, setEnv] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, env || rootsOpen, () => { setEnv(false); setRootsOpen(false) })
  const warn = Boolean(data) && ((data.roots ?? []).some(root => !root.ok) || !data.executor?.found || !data.skill?.found)
  return (
    <header className="hw-top">
      {header}
      {projects.length ? <ProjectSwitch projects={projects} selected={selected} onSelect={onSelect} onCreate={onCreate} /> : null}
      <div className="hw-top-right" ref={ref}>
        <button
          type="button"
          className={`hw-pill-btn ${env ? 'is-open' : ''}`}
          aria-expanded={env}
          onClick={() => { setEnv(value => !value); setRootsOpen(false) }}
        >
          <span className={`hw-status-dot ${!data ? '' : warn ? 'is-warn' : 'is-ok'}`} aria-hidden="true" />
          {!data ? '检查环境' : warn ? '环境待补' : '环境就绪'}
        </button>
        <button
          type="button"
          className={`hw-pill-btn ${rootsOpen ? 'is-open' : ''}`}
          aria-expanded={rootsOpen}
          onClick={() => { setRootsOpen(!rootsOpen); setEnv(false) }}
        >
          <Icon name="folder" size={14} />
          目录
        </button>
        {env ? <div className="hw-pop-anchor"><EnvPopover data={data} /></div> : null}
        {rootsOpen ? (
          <div className="hw-pop-anchor">
            <div className="hw-pop hw-pop-roots" role="dialog" aria-label="扫描目录">
              <p className="hw-pop-title">Hypit 根目录</p>
              <textarea
                className="hw-roots-input"
                value={rootsText}
                onChange={event => setRootsText(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); onScan(); setRootsOpen(false) }
                }}
                rows={3}
                spellCheck={false}
                autoFocus
                aria-label="Hypit 根目录，每行一个"
              />
              <div className="hw-pop-foot">
                <span>每行一个 · 支持 ~ · ⌘↩ 扫描</span>
                <button className="hw-cta is-small" type="button" disabled={loading} onClick={() => { onScan(); setRootsOpen(false) }}>
                  {loading ? '扫描中…' : '扫描'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}

/* ── 制作台 ───────────────────────────────────────── */

function Timeline({ stageKey, counts }) {
  const now = stageIndex(stageKey)
  const facts = [
    counts.source ? `${counts.source} 份 Source` : '还没写',
    now === 1 ? '轮到这步' : now > 1 ? '随时可跑' : '等脚本',
    counts.run ? `${counts.run} 条 Run` : now >= 2 ? '轮到这步' : '—',
    counts.result ? `${counts.result} 个文件` : now === 3 ? '轮到这步' : '—',
  ]
  return (
    <section className="hw-timeline" style={{ '--hw-at': (now + 0.5) / STAGES.length }} aria-label="制作进度">
      <div className="hw-track" aria-hidden="true">
        <span className="hw-track-fill" />
        <span className="hw-playhead"><i /></span>
      </div>
      <ol className="hw-steps">
        {STAGES.map((item, index) => {
          const state = index < now ? 'done' : index === now ? 'now' : 'todo'
          return (
            <li key={item.key} className={`hw-step is-${state}`} aria-current={state === 'now' ? 'step' : undefined}>
              <span className="hw-step-head">
                <span className="hw-step-index">{state === 'done' ? <Icon name="check" size={11} stroke={2} /> : pad(index + 1)}</span>
                <span className="hw-step-label">{item.label}</span>
              </span>
              <span className="hw-step-fact">{facts[index]}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function NextStep({ stage, onAsk, onTab }) {
  const now = stageIndex(stage.key)
  return (
    <section className="hw-next" aria-label="下一步">
      <span className="hw-next-numeral" aria-hidden="true">{pad(now + 1)}</span>
      <p className="hw-next-kicker">
        <span className="hw-next-rec" aria-hidden="true" />
        下一步 <span className="hw-mono">{pad(now + 1)} / {pad(STAGES.length)}</span>
      </p>
      <h2>{stage.title}</h2>
      <p className="hw-next-body">{stage.body}</p>
      <div className="hw-next-actions">
        <button className="hw-cta" type="button" onClick={() => (stage.tab ? onTab(stage.tab) : onAsk(stage.prompt))}>
          {stage.cta}
          <Icon name="arrow" size={15} />
        </button>
        {stage.alt ? (
          <button className="hw-text-btn" type="button" onClick={() => onAsk(stage.alt.prompt)}>
            {stage.alt.label}
          </button>
        ) : null}
      </div>
      <p className="hw-next-hint">按钮只把任务填进右侧助手，你看过再发送。</p>
    </section>
  )
}

function EmptyArt({ kind }) {
  return (
    <svg className="hw-empty-art" width="88" height="60" viewBox="0 0 88 60" fill="none" aria-hidden="true">
      <rect x="8.5" y="8.5" width="56" height="40" rx="5" stroke="currentColor" strokeDasharray="3 3" />
      {kind === 'results' ? <path d="M32 21.5v14l11-7-11-7Z" fill="currentColor" opacity="0.55" />
        : kind === 'runs' ? <path d="M19 21h22M19 28.5h32M19 36h14" stroke="currentColor" strokeLinecap="round" opacity="0.55" />
          : <path d="M19 21h18M19 28.5h26M19 36h12" stroke="currentColor" strokeLinecap="round" opacity="0.55" />}
      <path d="M70 18v24M76 24v12" stroke="var(--hw-brand)" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

/** Hypit 成片: build results + exported videos in the shared screening room. */
function HypitFilms({ api, detail, onAsk }) {
  const [films, setFilms] = useState(null)
  const [active, setActive] = useState('')
  const [error, setError] = useState('')
  const [posters, setPosters] = useState({})
  const exports = (detail.results ?? []).filter(item => /\.(mp4|mov|webm|m4v)$/iu.test(item.rel))
  const exportKey = exports.map(item => item.rel + item.updatedAt).join('|')

  useEffect(() => {
    let alive = true
    api.call({ op: 'builds', path: detail.id })
      .then(result => {
        if (!alive) return
        const fromBuilds = result.builds.map(build => ({
          id: build.id,
          kind: 'hypit',
          label: build.targets?.[0] ?? build.video.name ?? '成片',
          duration: build.duration,
          createdAt: build.finishedAt,
          run: build.run,
          source: build.source,
          chapters: build.chapters,
          verified: build.outcome === 'complete',
          verifiedLabel: '构建完成',
          load: { op: 'build-media', buildId: build.id },
          download: build.video.rel.split('/').pop(),
        }))
        const sizes = new Set(result.builds.map(build => build.video.bytes))
        const known = new Set()
        const fromExports = exports.filter(item => !sizes.has(item.bytes)).map(item => ({
          id: 'file:' + item.rel,
          kind: 'cut',
          label: item.rel.split('/').pop(),
          duration: 0,
          createdAt: item.updatedAt,
          chapters: [],
          load: { op: 'result-media', rel: item.rel },
          bytes: item.bytes,
        })).filter(item => !known.has(item.label) && known.add(item.label))
        const list = [...fromBuilds, ...fromExports]
        setFilms(list)
        setActive(previous => (list.some(film => film.id === previous) ? previous : list[0]?.id ?? ''))
      })
      .catch(reason => { if (alive) setError(messageFor(reason)) })
    return () => { alive = false }
  }, [api, detail.id, exportKey])

  useEffect(() => {
    if (!films?.length) return undefined
    let alive = true
    for (const film of films) {
      if (posters[film.id]) continue
      const ref = film.load.op === 'build-media' ? { buildId: film.load.buildId } : { rel: film.load.rel }
      api.call({ op: 'film-poster', path: detail.id, ...ref })
        .then(result => { if (alive) setPosters(previous => ({ ...previous, [film.id]: result.source })) })
        .catch(() => {})
    }
    return () => { alive = false }
  }, [api, detail.id, films])

  if (error) return <p className="hw-muted is-bad">{error}</p>
  if (!films) return <div className="hy-films is-loading" aria-hidden="true"><i /></div>
  if (!films.length) return null
  const film = films.find(item => item.id === active) ?? films[0]
  const poster = posters[film.id] ?? ''
  const source = {
    key: `${detail.id}/${film.id}`,
    name: detail.title,
    width: 1080,
    height: 1920,
    poster,
    kindLabel: film.kind === 'hypit' ? `Hypit 构建 · ${film.id.slice(4, 12)}` : '导出文件',
    noChapters: '这个文件是直接导出的视频，没有构建记录里的分段。点进度条任意位置跳转。',
    loadChunk: offset => api.call({ ...film.load, path: detail.id, offset }),
  }
  return (
    <div className="hy-films th-studio">
      <FilmPlayer key={film.id} source={source} film={film} onAsk={onAsk} />
      {films.length > 1 ? (
        <div className="th-shelf" role="list" aria-label="全部成片">
          <p className="th-shelf-title">全部成片 <span className="hw-mono">{pad(films.length)}</span></p>
          <div className="th-shelf-row">
            {films.map((item, index) => (
              <FilmCard key={item.id} film={item} poster={posters[item.id] ?? ''} index={index} active={item.id === film.id} onOpen={() => setActive(item.id)} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function Output({ api, detail, tab, setTab, onOpenSource, onAsk }) {
  const counts = detail.counts ?? {}
  const tabs = [
    { id: 'results', label: '成片', count: counts.result || 0, icon: 'film' },
    { id: 'runs', label: '运行', count: counts.run || 0, icon: 'run' },
    { id: 'sources', label: '源码', count: counts.source || 0, icon: 'code' },
    { id: 'docs', label: '笔记', count: counts.doc || 0, icon: 'doc' },
  ]
  const active = tabs.find(item => item.id === tab) ?? tabs[0]
  const items = tab === 'results' ? detail.results ?? []
    : tab === 'runs' ? detail.runs ?? []
      : tab === 'sources' ? detail.sources ?? []
        : []
  const empty = {
    results: { title: '还没有成片', body: '检查通过后再出片。出片前助手会先报大致花费和时间。', cta: '问助手要个报价', prompt: '按现有 Run 出第一版，先告诉我大概花多少、要多久。' },
    runs: { title: '还没有 Run', body: 'Run 描述一次出片要用的参数组合。可以让助手按这个项目补一条。', cta: '让助手补一条 Run', prompt: '给这个项目补一条最小可用的 .svrun，并说明每一行在做什么。' },
    sources: { title: '还没有 Source', body: 'SVML 是这条视频的脚本。让助手按项目现状写第一版。', cta: '让助手写第一版', prompt: '先看这个项目的 package.json 和已有文件，写一条最小可跑的 SVML Source，写进项目里。' },
    docs: { title: '还没有笔记', body: '项目里的 Markdown 会出现在这里，用来记这一版为什么这样改。', cta: '让助手记一笔', prompt: '在 notes/ 下新建一份笔记，记下这个项目现在的状态和下一步。' },
  }[tab] ?? null

  function act(item) {
    if (tab === 'sources') return onOpenSource(item.rel)
    onAsk(tab === 'results'
      ? `帮我看看 ${item.rel} 这一版结果怎么样，哪里还需要改。`
      : `解释 ${item.rel} 这份 Run 在做什么，改哪一行会有什么效果。`)
  }

  return (
    <section className="hw-output" aria-label="项目产出">
      <div className="hw-tabs" role="tablist" aria-label="产出类型">
        {tabs.map(item => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`hw-tab ${tab === item.id ? 'is-on' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <span className="hw-tab-count">{item.count}</span>
          </button>
        ))}
      </div>

      <div className="hw-output-body" role="tabpanel" aria-label={active.label} key={tab}>
        {tab === 'results' && detail.films ? (
          <HypitFilms api={api} detail={detail} onAsk={onAsk} />
        ) : tab === 'docs' && (detail.docs ?? []).length ? (
          <ul className="hw-docs">
            {(detail.docs ?? []).map((doc, index) => (
              <li key={doc.rel} style={{ '--i': index }}>
                <button type="button" className="hw-doc" onClick={() => onAsk(`读一下 ${doc.rel}，基于它继续推进这个项目。`)}>
                  <b>{doc.title}</b>
                  {doc.excerpt ? <p>{doc.excerpt}</p> : null}
                  <span>{doc.rel}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : items.length ? (
          <ul className="hw-rows">
            {items.map((item, index) => {
              const [dir, base] = splitRel(item.rel)
              return (
                <li key={item.rel} style={{ '--i': index }}>
                  <button type="button" className="hw-row" onClick={() => act(item)}>
                    <span className="hw-row-icon"><Icon name={active.icon} size={15} /></span>
                    <span className="hw-row-name">{dir ? <i>{dir}</i> : null}{base}</span>
                    <span className="hw-row-meta"><span className="hw-row-bytes">{formatBytes(item.bytes)}</span><em>·</em><span>{formatTime(item.updatedAt)}</span></span>
                    <span className="hw-row-go">{tab === 'sources' ? '查看' : '问助手'}<Icon name="arrow" size={12} /></span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : empty ? (
          <div className="hw-empty">
            <EmptyArt kind={tab} />
            <div>
              <h3>{empty.title}</h3>
              <p>{empty.body}</p>
              <button className="hw-text-btn is-strong" type="button" onClick={() => onAsk(empty.prompt)}>
                {empty.cta}
                <Icon name="arrow" size={13} />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

function SourceDrawer({ detail, api, initial, onClose, onAsk }) {
  const sources = detail.sources ?? []
  const [active, setActive] = useState(initial || sources[0]?.rel || '')
  const [content, setContent] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => { closeRef.current?.focus() }, [])

  useEffect(() => {
    if (!active) return undefined
    let alive = true
    setLoading(true)
    setError('')
    api.source(detail.id, active)
      .then(result => { if (alive) setContent(result) })
      .catch(reason => { if (alive) { setContent(null); setError(messageFor(reason)) } })
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [detail.id, active, api])

  useEffect(() => {
    function onKey(event) { if (event.key === 'Escape') onClose() }
    globalThis.document?.addEventListener('keydown', onKey)
    return () => globalThis.document?.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="hw-drawer" role="dialog" aria-modal="true" aria-label="源码">
      <div className="hw-drawer-head">
        <div className="hw-drawer-title">
          <Icon name="code" size={15} />
          <b>源码</b>
          <span className="hw-mono">{content ? `${content.lineCount} 行` : ''}</span>
        </div>
        <button className="hw-text-btn" type="button" onClick={() => { onAsk(`解释 ${active} 这份 Source 的结构，指出最值得改的地方。`); onClose() }}>
          问助手
          <Icon name="arrow" size={13} />
        </button>
        <button ref={closeRef} className="hw-icon-btn" type="button" onClick={onClose} aria-label="关闭源码（Esc）">
          <Icon name="x" size={15} />
        </button>
      </div>
      {sources.length > 1 ? (
        <div className="hw-drawer-tabs" role="tablist" aria-label="源文件">
          {sources.slice(0, 12).map(source => (
            <button
              key={source.rel}
              type="button"
              role="tab"
              aria-selected={source.rel === active}
              className={`hw-drawer-tab ${source.rel === active ? 'is-on' : ''}`}
              onClick={() => setActive(source.rel)}
            >
              {splitRel(source.rel)[1]}
            </button>
          ))}
        </div>
      ) : null}
      <div className="hw-code">
        {loading && !content ? <div className="hw-code-skeleton" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ width: `${30 + ((i * 37) % 55)}%` }} />)}</div> : null}
        {error ? <p className="hw-muted is-bad">{error}</p> : null}
        {!error && content ? (
          <>
            <p className="hw-code-path">{active}</p>
            <pre className={loading ? 'is-dim' : ''}>{content.lines.map((line, index) => (
              <React.Fragment key={index}><b>{index + 1}</b>{line || ' '}{'\n'}</React.Fragment>
            ))}</pre>
            {content.truncated ? <p className="hw-muted">只显示前 400 行，共 {content.lineCount} 行。</p> : null}
          </>
        ) : null}
        {!loading && !error && !sources.length ? <p className="hw-muted">这个项目里还没有 .svml 源文件。</p> : null}
      </div>
    </div>
  )
}

/* ── 空态 / 骨架 ─────────────────────────────────── */

function Setup({ data, onOpenRoots, onCreate }) {
  const [copied, copy] = useCopy()
  const roots = data?.roots ?? []
  const steps = [
    { done: Boolean(data?.skill?.found), title: '装 Hypit 技能', body: '让对话里的 agent 懂 SVML 和出片流程。', cmd: 'npx skills add hypit-ai/hypit -g --agent universal -y' },
    { done: Boolean(data?.executor?.found), title: '装执行器', body: '必须用官方源，国内镜像缺包。', cmd: 'npm i -g @hypit/hypit --registry=https://registry.npmjs.org' },
    { done: false, title: '把项目放进根目录', body: '目录里的 package.json 要有 "hypit": { "project": true }。' },
  ]
  return (
    <div className="hw-setup">
      <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />开始之前</p>
      <h2>先把 Hypit 接上。</h2>
      <p className="hw-setup-lead">工作台只读扫描目录，不会往项目里写东西。三步就能用。</p>
      <ol className="hw-setup-steps">
        {steps.map((step, index) => (
          <li key={step.title} className={step.done ? 'is-done' : ''} style={{ '--i': index }}>
            <span className="hw-setup-num">{step.done ? <Icon name="check" size={12} stroke={2} /> : pad(index + 1)}</span>
            <div className="hw-setup-main">
              <b>{step.title}{step.done ? <em>已就绪</em> : null}</b>
              <span>{step.body}</span>
              {step.cmd && !step.done ? (
                <button type="button" className="hw-cmd" onClick={() => copy(step.cmd)}>
                  <code>{step.cmd}</code>
                  <span>{copied === step.cmd ? <><Icon name="check" size={12} />已复制</> : <><Icon name="copy" size={12} />复制</>}</span>
                </button>
              ) : null}
              {index === 2 ? (
                <div className="hw-setup-roots">
                  {roots.map(root => (
                    <span key={root.path} className={root.ok ? '' : 'is-bad'}>
                      <code>{shortPath(root.path, 36)}</code>
                      {root.ok ? (root.created ? '刚创建，放项目进去再扫描' : '可读，还没有项目') : root.error}
                    </span>
                  ))}
                  <div className="hw-setup-actions">
                    <button className="hw-cta is-small" type="button" onClick={onCreate} disabled={!roots.some(root => root.ok)}>
                      <Icon name="plus" size={13} stroke={2} />
                      新建第一个项目
                    </button>
                    <button className="hw-text-btn" type="button" onClick={onOpenRoots}>
                      <Icon name="folder" size={13} />
                      改扫描目录
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

const BRIEF_SAMPLES = [
  '30 秒竖屏口播：讲清楚一个产品卖点，结尾留一句行动号召。',
  '15 秒横屏开箱：三个镜头，节奏快，配大字标题。',
  '1 分钟知识短片：一个问题、三个要点、一个结论。',
]

function CreateDialog({ roots, api, onClose, onCreated }) {
  const usable = roots.filter(root => root.ok)
  const [root, setRoot] = useState(usable[0]?.path ?? '')
  const [name, setName] = useState('')
  const [brief, setBrief] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)
  const nameRef = useRef(null)
  useDismiss(ref, true, () => { if (!busy) onClose() })
  useEffect(() => { nameRef.current?.focus() }, [])

  const slug = name.trim().replace(/\s+/gu, '-').replace(/[^\p{L}\p{N}._-]+/gu, '').replace(/-{2,}/g, '-').replace(/^[.-]+|[.-]+$/g, '')
  const taken = usable.find(item => item.path === root)?.projects?.some(project => project.root.endsWith('/' + slug))

  async function submit(event) {
    event?.preventDefault()
    if (!slug || busy || taken) return
    setBusy(true)
    setError('')
    try {
      const made = await api.create(root, slug, brief)
      onCreated(made, brief.trim())
    } catch (reason) {
      setError(messageFor(reason))
      setBusy(false)
    }
  }

  return (
    <div className="hw-modal-scrim">
      <form className="hw-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="hw-create-title" onSubmit={submit}>
        <div className="hw-modal-head">
          <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />新项目</p>
          <button type="button" className="hw-icon-btn" onClick={onClose} aria-label="关闭（Esc）"><Icon name="x" size={15} /></button>
        </div>
        <h2 id="hw-create-title">做一条什么样的视频？</h2>

        <label className="hw-input-block">
          <span>项目名</span>
          <input
            ref={nameRef}
            value={name}
            onChange={event => { setName(event.target.value); setError('') }}
            placeholder="比如 launch-teaser"
            maxLength={64}
            spellCheck={false}
            autoComplete="off"
          />
          <em className={taken ? 'is-bad' : ''}>
            {taken ? '这个名字已经有项目了' : slug ? <>会建在 <code>{shortPath(`${root}/${slug}`, 48)}</code></> : '字母、数字、中文、横线都可以'}
          </em>
        </label>

        <label className="hw-input-block">
          <span>一句话描述 <i>可选</i></span>
          <textarea
            value={brief}
            onChange={event => setBrief(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) submit(event) }}
            rows={3}
            placeholder="时长、横竖屏、讲什么、什么风格……"
          />
        </label>
        {!brief ? (
          <div className="hw-samples" aria-label="示例描述">
            {BRIEF_SAMPLES.map(sample => (
              <button key={sample} type="button" onClick={() => setBrief(sample)}>{sample}</button>
            ))}
          </div>
        ) : null}

        {usable.length > 1 ? (
          <label className="hw-input-block">
            <span>放在</span>
            <select value={root} onChange={event => setRoot(event.target.value)}>
              {usable.map(item => <option key={item.path} value={item.path}>{shortPath(item.path, 48)}</option>)}
            </select>
          </label>
        ) : null}

        {error ? <p className="hw-modal-error" role="alert">{error}</p> : null}

        <div className="hw-modal-foot">
          <span>只建 <code>package.json</code>{brief.trim() ? <> 和 <code>notes/brief.md</code></> : null}，脚本交给助手写。</span>
          <button className="hw-cta" type="submit" disabled={!slug || busy || taken}>
            {busy ? <span className="hw-spinner is-light" aria-hidden="true" /> : null}
            {busy ? '正在建' : '建好并开写'}
            {busy ? null : <Icon name="arrow" size={15} />}
          </button>
        </div>
      </form>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="hw-skeleton" aria-hidden="true">
      <i style={{ width: 180, height: 10 }} />
      <i style={{ width: '46%', height: 34, marginTop: 14 }} />
      <i style={{ width: '100%', height: 54, marginTop: 34 }} />
      <i style={{ width: '100%', height: 168, marginTop: 22, borderRadius: 18 }} />
    </div>
  )
}

/* ── 主面板 ───────────────────────────────────────── */

export function HypitStudio({ api, header }) {
  const stored = useMemo(() => loadRoots(), [])
  const [roots, setRoots] = useState(stored)
  const [rootsText, setRootsText] = useState(stored.join('\n'))
  const [rootsOpen, setRootsOpen] = useState(false)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState('')
  const [detail, setDetail] = useState(null)
  const [detailError, setDetailError] = useState('')
  const [notice, setNotice] = useState(null)
  const [tab, setTab] = useState('results')
  const [drawer, setDrawer] = useState(null)
  const [pendingPrompt, setPendingPrompt] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [detailKey, setDetailKey] = useState(0)
  const [copied, copy] = useCopy()
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(async (rawRoots, options = {}) => {
    if (!options.quiet) setLoading(true)
    setError('')
    try {
      const result = await api.overview(rawRoots)
      setData(result)
      const projects = result.roots.flatMap(root => root.projects ?? [])
      setSelected(previous => (projects.some(item => item.id === previous) ? previous : projects[0]?.id ?? ''))
      const created = (result.roots ?? []).filter(root => root.created)
      if (created.length) {
        setNotice({ kind: 'success', text: `已创建 ${created.map(root => shortPath(root.path, 40)).join('、')}，把项目放进去后再扫描。` })
      }
    } catch (reason) {
      setError(messageFor(reason))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [api])

  useEffect(() => {
    let alive = true
    Promise.resolve().then(() => { if (alive) void refresh(stored) })
    return () => { alive = false }
  }, [refresh, stored])

  useEffect(() => {
    if (!selected) { setDetail(null); return undefined }
    let alive = true
    setDetailError('')
    api.project(selected)
      .then(result => {
        if (!alive) return
        setDetail(previous => {
          if (previous?.id !== result.id) {
            setDrawer(null)
            setTab(result.counts?.result ? 'results' : result.counts?.run ? 'runs' : 'sources')
          }
          return result
        })
      })
      .catch(reason => { if (alive) { setDetail(null); setDetailError(messageFor(reason)) } })
    return () => { alive = false }
  }, [selected, api, detailKey])

  const projects = useMemo(() => (data?.roots ?? []).flatMap(root => root.projects ?? []), [data])
  const stage = detail ? stageOf(detail) : null
  const ask = useCallback(prompt => setPendingPrompt({ text: prompt }), [])
  const consume = useCallback(() => setPendingPrompt(null), [])
  const closeDrawer = useCallback(() => setDrawer(null), [])
  const showAssistant = Boolean(detail) || (projects.length > 0 && !detailError)
  const openCreate = useCallback(() => setCreating(true), [])
  const bumpDetail = useCallback(() => setDetailKey(value => value + 1), [])
  const chatApi = useMemo(() => (detail ? api.chatFor({ path: detail.id }) : null), [api, detail?.id])

  useEffect(() => {
    function onKey(event) {
      const target = event.target
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if ((event.key === 'n' || event.key === 'N') && data && (data.roots ?? []).some(root => root.ok)) {
        event.preventDefault()
        setCreating(true)
      }
    }
    globalThis.document?.addEventListener('keydown', onKey)
    return () => globalThis.document?.removeEventListener('keydown', onKey)
  }, [data])

  async function onCreated(made, brief) {
    setCreating(false)
    await refresh(roots, { quiet: true })
    setSelected(made.root)
    setNotice({ kind: 'success', text: `已建好「${made.name}」。第一版脚本的任务已经填进助手，看一眼就可以发送。` })
    setPendingPrompt({ for: made.root, text: brief
      ? `这是一个新建的 Hypit 项目，需求在 notes/brief.md：「${brief}」。按 Hypit 技能的约定，写一条最小可跑的 SVML Source 和对应的 .svrun，写进项目里，然后跑 hypit_check 确认通过。不要提交会花钱的构建。`
      : '这是一个新建的空 Hypit 项目。先问我想做什么样的视频（时长、横竖屏、内容、风格），问清楚之后再写第一版 SVML Source 和 .svrun。' })
  }

  return (
    <div className="hw-studio">
      <TopBar
        header={header}
        data={data}
        loading={loading}
        rootsText={rootsText}
        setRootsText={setRootsText}
        rootsOpen={rootsOpen}
        setRootsOpen={setRootsOpen}
        projects={projects}
        selected={selected}
        onSelect={id => { setSelected(id); setNotice(null) }}
        onCreate={openCreate}
        onScan={() => {
          const next = splitRoots(rootsText)
          saveRoots(next)
          setRoots(next)
          setNotice(null)
          void refresh(next)
        }}
      />

      <div className={`hw-shell ${showAssistant ? '' : 'is-solo'}`}>
        <main className="hw-stage">
          <div className="hw-toasts">
            {notice ? <Toast text={notice.text} kind={notice.kind} onClose={() => setNotice(null)} /> : null}
            {error ? <Toast text={error} onClose={() => setError('')} /> : null}
          </div>
          <div className="hw-stage-scroll">
            {loading && !data ? (
              <Skeleton />
            ) : !projects.length ? (
              <Setup data={data} onOpenRoots={() => setRootsOpen(true)} onCreate={openCreate} />
            ) : detail ? (
              <div className="hw-stage-inner" key={detail.id}>
                <div className="hw-masthead">
                  <div className="hw-masthead-main">
                    <button className="hw-path" type="button" onClick={() => copy(detail.root, 'path')} title={`复制 ${detail.root}`}>
                      <span>{shortPath(detail.root, 56)}</span>
                      <Icon name={copied === 'path' ? 'check' : 'copy'} size={12} />
                      <em>{copied === 'path' ? '已复制' : '复制路径'}</em>
                    </button>
                    <h1>{detail.title}</h1>
                  </div>
                  <div className="hw-masthead-side">
                    <span className="hw-updated">{formatTime(detail.updatedAt)}更新</span>
                    <button
                      className={`hw-icon-btn ${refreshing ? 'is-busy' : ''}`}
                      type="button"
                      aria-label="重新扫描这个项目"
                      title="重新扫描"
                      onClick={() => { setRefreshing(true); setDetailKey(value => value + 1); void refresh(roots, { quiet: true }) }}
                    >
                      <Icon name="refresh" size={15} />
                    </button>
                  </div>
                </div>

                <Timeline stageKey={stage.key} counts={detail.counts ?? {}} />
                <NextStep stage={stage} onAsk={ask} onTab={value => { setTab(value); setDrawer(null) }} />
                <Output api={api} detail={detail} tab={tab} setTab={setTab} onOpenSource={rel => setDrawer({ rel })} onAsk={ask} />
              </div>
            ) : detailError ? (
              <div className="hw-state">
                <h2>这个项目读不出来</h2>
                <p>{detailError}</p>
                <button className="hw-cta is-small" type="button" onClick={() => setDetailKey(value => value + 1)}>重试</button>
              </div>
            ) : (
              <Skeleton />
            )}
          </div>
          {drawer && detail ? <SourceDrawer detail={detail} api={api} initial={drawer.rel} onClose={closeDrawer} onAsk={ask} /> : null}
        </main>

        {detail ? (
          <Assistant
            key={detail.id}
            target={{
              id: detail.id,
              title: detail.title,
              hint: detail.root,
              body: '它能读写这个项目、跑命令和 hypit 检查。要花钱的构建，它会先报价，等你点头。',
              prompts: [stage?.prompt ?? '先读一遍这个项目，告诉我现在到哪一步。', '这个项目现在能跑吗？先 check，有错直接修', '把这条 Source 改成竖屏 9:16'],
            }}
            chat={chatApi}
            pendingPrompt={pendingPrompt}
            onConsume={consume}
            onTurnDone={bumpDetail}
          />
        ) : showAssistant ? (
          <aside className="hw-assistant is-empty" aria-hidden="true" />
        ) : null}
      </div>
      {creating ? <CreateDialog roots={data?.roots ?? []} api={api} onClose={() => setCreating(false)} onCreated={onCreated} /> : null}
    </div>
  )
}
