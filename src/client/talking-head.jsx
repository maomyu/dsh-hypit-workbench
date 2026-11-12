/**
 * 网感口播 · 文稿剪辑台
 *
 * Layout: monitor (left) · transcript paper (centre) · assistant (right).
 * The transcript is the editing surface: click a sentence to seek, shift-click
 * to extend, ⌫ to cut, ⇧⌫ to restore, Q to quote into the assistant.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatTime, messageFor } from '../view.js'
import { openKeySettings } from './keys.js'
import { Icon, Toast, pad, useDismiss } from './shared.jsx'
import { Assistant } from './assistant.jsx'

const CLIP_KEY = 'dsh.video-workbench.clip.v1'
const STYLE_COVERS = new Map()

export function clipTime(seconds, precise = false) {
  const value = Math.max(0, Number(seconds) || 0)
  const m = Math.floor(value / 60)
  const s = value - m * 60
  return precise ? `${pad(m)}:${s.toFixed(2).padStart(5, '0')}` : `${pad(m)}:${pad(Math.floor(s))}`
}

/** The production prompt for the chosen style; mirrors fullVideoPrompt on the host. */
export function stylePrompt(preferences) {
  const { style, branch, component, orchestration } = preferences ?? {}
  return '按实际内容设计并制作完整视频，' +
    (style ? `母画风使用已选的「${style.name}」` : '按内容自主选择母画风') +
    (branch ? `，分支选「${branch.name}」` : '') +
    (component ? `，参照组件「${component.name}」并按文案适配` : '') +
    (orchestration ? `，编排使用「${orchestration.name}」` : '，按当前文案选择编排') +
    '，保留原声与原意。'
}

/** The tail of a job error is where the reason is; the head is progress noise. */
function lastLines(text, count) {
  const lines = String(text ?? '').split('\n').map(line => line.trim()).filter(line => line && !/^\[hyperframes\]/u.test(line))
  return lines.slice(-count).join(' / ').slice(0, 400)
}

function operationId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

const decode = data => Uint8Array.from(atob(data), char => char.charCodeAt(0))

/** Fetch a media file over chunked RPC, 4 in flight, keeping byte order. */
async function loadMedia(request, signal, progress) {
  const first = await request(0)
  if (!Number.isSafeInteger(first.size) || first.next < 1) throw new Error('视频数据不完整，请刷新后重试')
  const parts = [decode(first.data)]
  const step = first.next
  let cursor = first.next
  let loaded = first.next
  progress?.(loaded / first.size)
  const worker = async () => {
    while (cursor < first.size) {
      signal?.throwIfAborted()
      const offset = cursor
      cursor = Math.min(first.size, cursor + step)
      const part = await request(offset)
      if (part.size !== first.size) throw new Error('视频在读取时发生了变化，请重试')
      parts[offset / step] = decode(part.data)
      loaded += part.next - offset
      progress?.(loaded / first.size)
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, Math.ceil((first.size - first.next) / step)) }, worker))
  return new Blob(parts, { type: first.mime || 'video/mp4' })
}

/* ── Monitor ─────────────────────────────────────── */

function Monitor({ api, clip, version, onVersion, videoRef, position, onTime, playing, onPlaying }) {
  const [state, setState] = useState({ url: '', progress: 0, error: '' })
  const [compat, setCompat] = useState(false)
  const [muted, setMuted] = useState(false)
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useDismiss(menuRef, open, () => setOpen(false))
  const versions = [{ id: 'source', label: '原片', duration: clip.duration }, ...[...clip.versions].reverse()]
  const active = versions.find(item => item.id === version) ?? versions[0]

  useEffect(() => {
    const controller = new AbortController()
    let url = ''
    setState({ url: '', progress: 0, error: '' })
    loadMedia(
      offset => api.clip('media', { projectId: clip.id, version, offset, compat }),
      controller.signal,
      progress => setState(previous => ({ ...previous, progress })),
    ).then(blob => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(blob)
      setState({ url, progress: 1, error: '' })
    }).catch(reason => {
      if (!controller.signal.aborted) setState({ url: '', progress: 0, error: messageFor(reason) })
    })
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [api, clip.id, version, compat])

  const ratio = clip.width && clip.height ? `${clip.width} / ${clip.height}` : '9 / 16'
  const ar = clip.width && clip.height ? clip.width / clip.height : 0.5625
  const duration = active?.duration ?? clip.duration

  function toggle() {
    const node = videoRef.current
    if (!node) return
    if (node.paused) void node.play().catch(() => {})
    else node.pause()
  }

  return (
    <section className="th-monitor" aria-label="监看">
      <div className="th-monitor-head" ref={menuRef}>
        <button type="button" className={`th-version ${open ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}>
          <span className={`th-version-dot ${version === 'source' ? '' : 'is-cut'}`} aria-hidden="true" />
          <b>{active?.label ?? '原片'}</b>
          <span className="hw-mono">{clipTime(duration)}</span>
          <Icon name="chevronDown" size={11} />
        </button>
        {open ? (
          <ul className="hw-pop th-version-pop" role="listbox" aria-label="版本">
            {versions.map(item => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={item.id === version}
                  className={item.id === version ? 'is-on' : ''}
                  onClick={() => { onVersion(item.id); setOpen(false) }}
                >
                  <span className={`th-version-dot ${item.id === 'source' ? '' : 'is-cut'}`} aria-hidden="true" />
                  <span className="th-version-name">{item.label}</span>
                  <span className="hw-mono">{clipTime(item.duration)}</span>
                  {item.createdAt ? <em>{formatTime(item.createdAt)}</em> : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        {state.url ? (
          <a className="hw-icon-btn" href={state.url} download={`${clip.name}-${active?.label ?? '原片'}.${compat ? 'webm' : 'mp4'}`} title="下载这个版本" aria-label="下载这个版本">
            <Icon name="download" size={15} />
          </a>
        ) : null}
      </div>

      <div className="th-frame" style={{ '--th-ratio': ratio, '--th-ar': ar }}>
        {state.url ? (
          <video
            ref={videoRef}
            src={state.url}
            muted={muted}
            playsInline
            onClick={toggle}
            onTimeUpdate={event => onTime(event.currentTarget.currentTime)}
            onPlay={() => onPlaying(true)}
            onPause={() => onPlaying(false)}
            onError={() => { if (!compat) setCompat(true) }}
            aria-label={`${clip.name} · ${active?.label ?? '原片'}`}
          />
        ) : (
          <div className="th-frame-state">
            {state.error ? (
              <>
                <p>{state.error}</p>
                <button type="button" className="hw-text-btn is-strong" onClick={() => setCompat(value => !value)}>换一种格式再试</button>
              </>
            ) : (
              <>
                <span className="th-load" style={{ '--p': state.progress }} aria-hidden="true" />
                <p className="hw-mono">{Math.round(state.progress * 100)}%</p>
              </>
            )}
          </div>
        )}
        {state.url && !playing ? (
          <button type="button" className="th-bigplay" onClick={toggle} aria-label="播放">
            <Icon name="play" size={22} />
          </button>
        ) : null}
      </div>

      <div className="th-transport">
        <button type="button" className="th-play" onClick={toggle} aria-label={playing ? '暂停' : '播放'} disabled={!state.url}>
          {playing ? <span className="th-pause" aria-hidden="true"><i /><i /></span> : <Icon name="play" size={14} />}
        </button>
        <span className="hw-mono th-clock">{clipTime(position, true)}<i> / {clipTime(duration)}</i></span>
        <button type="button" className="hw-icon-btn" onClick={() => setMuted(value => !value)} aria-label={muted ? '取消静音' : '静音'} title={muted ? '取消静音' : '静音'}>
          <Icon name={muted ? 'mute' : 'sound'} size={15} />
        </button>
      </div>
    </section>
  )
}


/* ── 成片 · finished films ────────────────────────── */

const STILLS = new Map()

function useStill(api, clipId, film, which) {
  const key = `${clipId}/${film?.id}/${which}`
  const [src, setSrc] = useState(STILLS.get(key) ?? '')
  const available = which === 'poster' ? film?.hasPoster : film?.hasContact
  useEffect(() => {
    if (!film || !available || STILLS.has(key)) { setSrc(STILLS.get(key) ?? ''); return undefined }
    let alive = true
    api.clip('film_image', { projectId: clipId, versionId: film.id, which })
      .then(result => { STILLS.set(key, result.source); if (alive) setSrc(result.source) })
      .catch(() => {})
    return () => { alive = false }
  }, [api, clipId, film?.id, which, available, key])
  return src
}

/** Poster for a cut version: grab a frame from the loaded video. */
function useVideoFrame(url, at = 0.5) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    if (!url) return undefined
    let alive = true
    const video = document.createElement('video')
    video.muted = true
    video.preload = 'auto'
    video.src = url
    const grab = () => {
      try {
        const canvas = document.createElement('canvas')
        const scale = 360 / Math.max(1, video.videoWidth)
        canvas.width = Math.round(video.videoWidth * scale)
        canvas.height = Math.round(video.videoHeight * scale)
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
        if (alive) setSrc(canvas.toDataURL('image/jpeg', 0.82))
      } catch {}
    }
    video.addEventListener('loadeddata', () => { video.currentTime = Math.min(at, (video.duration || 1) * 0.1) }, { once: true })
    video.addEventListener('seeked', grab, { once: true })
    return () => { alive = false; video.removeAttribute('src'); video.load() }
  }, [url, at])
  return src
}

export function FilmCard({ film, poster, active, onOpen, index }) {
  return (
    <button type="button" className={`th-film-card ${active ? 'is-on' : ''}`} onClick={onOpen} style={{ '--i': index }} aria-pressed={active}>
      <span className="th-film-thumb">
        {poster ? <img src={poster} alt="" /> : <span className="th-film-thumb-ph" aria-hidden="true"><Icon name={film.kind === 'cut' ? 'scissors' : 'film'} size={18} /></span>}
        <span className="th-film-dur hw-mono">{clipTime(film.duration)}</span>
      </span>
      <span className="th-film-meta">
        <b>{film.label}</b>
        <span>{film.kind === 'cut' ? '剪辑版本' : film.kind === 'hypit' ? (film.run || 'Hypit 构建') : film.style ?? '创作版本'} · {formatTime(film.createdAt)}</span>
      </span>
    </button>
  )
}

/**
 * Screening-room player shared by 网感口播 and Hypit.
 * source: { key, name, width, height, loadChunk(offset, compat), poster?, contact?, kindLabel }
 */
export function FilmPlayer({ source, film, onAsk }) {
  const [state, setState] = useState({ url: '', progress: 0, error: '' })
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [muted, setMuted] = useState(false)
  const [hover, setHover] = useState(-1)
  const [compat, setCompat] = useState(false)
  const videoRef = useRef(null)
  const scrubRef = useRef(null)
  const stageRef = useRef(null)
  const poster = source.poster ?? ''
  const contact = source.contact ?? ''
  const framePoster = useVideoFrame(!poster ? state.url : '')

  useEffect(() => {
    const controller = new AbortController()
    let url = ''
    setState({ url: '', progress: 0, error: '' })
    setPlaying(false)
    setTime(0)
    loadMedia(
      offset => source.loadChunk(offset, compat),
      controller.signal,
      progress => setState(previous => ({ ...previous, progress })),
    ).then(blob => {
      if (controller.signal.aborted) return
      url = URL.createObjectURL(blob)
      setState({ url, progress: 1, error: '' })
    }).catch(reason => { if (!controller.signal.aborted) setState({ url: '', progress: 0, error: messageFor(reason) }) })
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url) }
  }, [source.key, film.id, compat])

  const duration = film.duration || 1
  const chapters = film.chapters ?? []
  const current = chapters.findIndex(chapter => time >= chapter.start && time < chapter.end)

  function toggle() {
    const node = videoRef.current
    if (!node) return
    node.paused ? void node.play().catch(() => {}) : node.pause()
  }
  function seek(seconds) {
    const node = videoRef.current
    if (!node) return
    node.currentTime = Math.max(0, Math.min(duration - 0.05, seconds))
    setTime(node.currentTime)
  }
  function fromPointer(event) {
    const rect = scrubRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
  }
  function fullscreen() {
    const node = stageRef.current
    if (!node) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void node.requestFullscreen?.()
  }

  // ←/→ seek 5s, J/L chapter, Space play, F fullscreen
  useEffect(() => {
    function onKey(event) {
      const t = event.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if (event.key === ' ') { event.preventDefault(); toggle() }
      else if (event.key === 'ArrowRight') { event.preventDefault(); seek(time + 5) }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); seek(time - 5) }
      else if ((event.key === 'l' || event.key === 'L') && chapters.length) seek(chapters[Math.min(chapters.length - 1, current + 1)]?.start ?? 0)
      else if ((event.key === 'j' || event.key === 'J') && chapters.length) seek(chapters[Math.max(0, current - (time - (chapters[current]?.start ?? 0) > 1.5 ? 0 : 1))]?.start ?? 0)
      else if (event.key === 'f' || event.key === 'F') fullscreen()
    }
    globalThis.document?.addEventListener('keydown', onKey)
    return () => globalThis.document?.removeEventListener('keydown', onKey)
  })

  const ratio = source.width && source.height ? source.width / source.height : 0.5625
  const hoverTime = hover >= 0 ? hover * duration : -1
  const hoverTile = hover >= 0 ? Math.min(15, Math.floor(hover * 16)) : 0

  return (
    <div className="th-film">
      <div className="th-film-stage" ref={stageRef} style={{ '--th-ar': ratio }}>
        <div className="th-film-glow" aria-hidden="true" style={{ backgroundImage: poster || framePoster ? `url(${poster || framePoster})` : undefined }} />
        <div className="th-film-frame">
          {state.url ? (
            <video
              ref={videoRef}
              src={state.url}
              poster={poster || framePoster || undefined}
              muted={muted}
              playsInline
              onClick={toggle}
              onTimeUpdate={event => setTime(event.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => { if (!compat) setCompat(true) }}
              aria-label={`${source.name} · ${film.label}`}
            />
          ) : (
            <div className="th-film-loading" style={poster ? { backgroundImage: `url(${poster})` } : undefined}>
              {state.error ? <p>{state.error}</p> : (
                <span className="th-film-ring" style={{ '--p': state.progress }} aria-label={`载入 ${Math.round(state.progress * 100)}%`}>
                  <span className="hw-mono">{Math.round(state.progress * 100)}</span>
                </span>
              )}
            </div>
          )}
          {state.url && !playing ? (
            <button type="button" className="th-film-play" onClick={toggle} aria-label="播放">
              <Icon name="play" size={26} />
            </button>
          ) : null}
          {current >= 0 && playing ? <span key={current} className="th-film-chapter-flag">{pad(current + 1)} · {chapters[current].title}</span> : null}
        </div>
      </div>

      <div className="th-film-bar">
        <button type="button" className="th-play" onClick={toggle} disabled={!state.url} aria-label={playing ? '暂停' : '播放'}>
          {playing ? <span className="th-pause" aria-hidden="true"><i /><i /></span> : <Icon name="play" size={14} />}
        </button>
        <div
          className="th-scrub"
          ref={scrubRef}
          role="slider"
          tabIndex={0}
          aria-label="播放进度"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          onPointerMove={event => setHover(fromPointer(event))}
          onPointerLeave={() => setHover(-1)}
          onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); seek(fromPointer(event) * duration) }}
          onPointerUp={event => event.currentTarget.releasePointerCapture(event.pointerId)}
          onKeyDown={event => { if (event.key === 'ArrowRight') seek(time + 1); if (event.key === 'ArrowLeft') seek(time - 1) }}
        >
          <div className="th-scrub-track">
            {chapters.length ? chapters.map(chapter => (
              <span
                key={chapter.index}
                className={`th-scrub-seg ${chapter.index === current ? 'is-now' : ''}`}
                style={{ left: `${(chapter.start / duration) * 100}%`, width: `${((chapter.end - chapter.start) / duration) * 100}%` }}
              >
                <i style={{ transform: `scaleX(${Math.max(0, Math.min(1, (time - chapter.start) / (chapter.end - chapter.start)))})` }} />
              </span>
            )) : (
              <span className="th-scrub-seg" style={{ left: 0, width: '100%' }}><i style={{ transform: `scaleX(${time / duration})` }} /></span>
            )}
          </div>
          {hover >= 0 ? (
            <span className="th-scrub-peek" style={{ left: `${hover * 100}%` }}>
              {contact ? <span className="th-scrub-tile" style={{ backgroundImage: `url(${contact})`, backgroundPosition: `${(hoverTile % 4) * 33.333}% ${Math.floor(hoverTile / 4) * 33.333}%` }} /> : null}
              <span className="hw-mono">{clipTime(hoverTime)}</span>
              {chapters.length ? <em>{chapters.find(chapter => hoverTime >= chapter.start && hoverTime < chapter.end)?.title}</em> : null}
            </span>
          ) : null}
        </div>
        <span className="hw-mono th-clock">{clipTime(time)}<i> / {clipTime(duration)}</i></span>
        <button type="button" className="hw-icon-btn" onClick={() => setMuted(value => !value)} aria-label={muted ? '取消静音' : '静音'} title={muted ? '取消静音' : '静音'}>
          <Icon name={muted ? 'mute' : 'sound'} size={15} />
        </button>
        <button type="button" className="hw-icon-btn" onClick={fullscreen} aria-label="全屏" title="全屏 (F)">
          <Icon name="expand" size={15} />
        </button>
      </div>

      <aside className="th-film-side">
        <div className="th-film-title">
          <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />{source.kindLabel ?? (film.kind === 'cut' ? '剪辑版本' : '创作版本')}</p>
          <h2>{film.label}</h2>
          <dl className="th-film-facts">
            <div><dt>时长</dt><dd className="hw-mono">{clipTime(film.duration, true)}</dd></div>
            {film.style ? <div><dt>画风</dt><dd>{film.style}</dd></div> : null}
            {film.run ? <div><dt>Run</dt><dd className="hw-mono">{film.run}</dd></div> : null}
            {film.source ? <div><dt>Source</dt><dd className="hw-mono">{film.source}</dd></div> : null}
            {film.orchestration ? <div><dt>编排</dt><dd>{film.orchestration}</dd></div> : null}
            <div><dt>完成</dt><dd>{formatTime(film.createdAt)}</dd></div>
            {film.verified ? <div><dt>校验</dt><dd className="th-film-ok"><Icon name="check" size={12} stroke={2.2} />{film.verifiedLabel ?? '原声对齐 · 质检通过'}</dd></div> : null}
          </dl>
          <div className="th-film-actions">
            {state.url ? (
              <a className="hw-cta is-small" href={state.url} download={`${source.name}-${film.label}.${compat ? 'webm' : 'mp4'}`}>
                <Icon name="download" size={13} />
                下载 MP4
              </a>
            ) : null}
            <button type="button" className="hw-text-btn" onClick={() => onAsk(`看一下「${film.label}」这版成片，按优先级说说哪里还能更好。`)}>
              让助手点评
            </button>
          </div>
        </div>

        {chapters.length ? (
          <ol className="th-chapters" aria-label="章节">
            {chapters.map(chapter => (
              <li key={chapter.index} style={{ '--i': chapter.index }}>
                <button type="button" className={`th-chapter ${chapter.index === current ? 'is-now' : ''}`} onClick={() => { seek(chapter.start + 0.01); videoRef.current?.play?.().catch(() => {}) }}>
                  <span className="th-chapter-n hw-mono">{pad(chapter.index + 1)}</span>
                  <span className="th-chapter-main">
                    <b>{chapter.title}</b>
                    <span>{chapter.purpose}</span>
                  </span>
                  <span className="th-chapter-t hw-mono">{clipTime(chapter.start)}</span>
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="th-film-note">{source.noChapters ?? '剪辑版本按文稿删改直接剪出，没有分镜章节。点进度条任意位置跳转。'}</p>
        )}
        <p className="th-film-keys hw-mono">空格 播放 · ←/→ 5 秒 · J/L 章节 · F 全屏</p>
      </aside>
    </div>
  )
}

function ClipFilm({ api, clip, film, onAsk }) {
  const poster = useStill(api, clip.id, film, 'poster')
  const contact = useStill(api, clip.id, film, 'contact')
  const source = {
    key: `${clip.id}/${film.id}`,
    name: clip.name,
    width: clip.width,
    height: clip.height,
    poster,
    contact,
    loadChunk: (offset, compat) => api.clip('media', { projectId: clip.id, version: film.id, offset, compat }),
  }
  return <FilmPlayer source={source} film={film} onAsk={onAsk} />
}

function ClipFilmCard({ api, clip, film, ...rest }) {
  const poster = useStill(api, clip.id, film, 'poster')
  return <FilmCard film={film} poster={poster} {...rest} />
}

function FilmsView({ api, clip, onAsk, initial }) {
  const [films, setFilms] = useState(null)
  const [active, setActive] = useState(initial ?? '')
  const [error, setError] = useState('')
  const versionKey = clip.versions.map(item => item.id).join(',')
  useEffect(() => {
    let alive = true
    api.clip('films', { projectId: clip.id })
      .then(result => {
        if (!alive) return
        setFilms(result.films)
        setActive(previous => (result.films.some(film => film.id === previous) ? previous : result.films[0]?.id ?? ''))
      })
      .catch(reason => { if (alive) setError(messageFor(reason)) })
    return () => { alive = false }
  }, [api, clip.id, versionKey])
  useEffect(() => { if (initial) setActive(initial) }, [initial])

  if (error) return <div className="hw-state"><p>{error}</p></div>
  if (!films) return <div className="th-films-skeleton" aria-hidden="true"><i /><i /></div>
  if (!films.length) {
    return (
      <div className="th-films-empty">
        <span className="th-empty-mark" aria-hidden="true"><Icon name="film" size={22} /></span>
        <h3>还没有成片</h3>
        <p>删几句出一个剪辑版本，或者选好画风让助手做一版完整视频，做好就会出现在这里。</p>
        <button type="button" className="hw-cta" onClick={() => onAsk('按已选画风做一版完整视频，保留原声。')}>
          做一版整片
          <Icon name="arrow" size={15} />
        </button>
      </div>
    )
  }
  const film = films.find(item => item.id === active) ?? films[0]
  return (
    <div className="th-films">
      <ClipFilm key={film.id} api={api} clip={clip} film={film} onAsk={onAsk} />
      {films.length > 1 ? (
        <div className="th-shelf" role="list" aria-label="全部成片">
          <p className="th-shelf-title">全部成片 <span className="hw-mono">{pad(films.length)}</span></p>
          <div className="th-shelf-row">
            {films.map((item, index) => (
              <ClipFilmCard key={item.id} api={api} clip={clip} film={item} index={index} active={item.id === film.id} onOpen={() => setActive(item.id)} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ── Semantic timeline: one block per sentence ───── */

function Strip({ clip, deleted, position, version, onSeek, selection }) {
  const cut = new Set(deleted)
  const picked = new Set(selection)
  const total = clip.duration || 1
  return (
    <div className="th-strip" role="presentation">
      <div className="th-strip-track">
        {clip.transcript.map((line, index) => (
          <button
            key={index}
            type="button"
            tabIndex={-1}
            className={`th-strip-seg ${cut.has(index) ? 'is-cut' : ''} ${picked.has(index) ? 'is-picked' : ''}`}
            style={{ left: `${(line.start / total) * 100}%`, width: `${Math.max(0.4, ((line.end - line.start) / total) * 100)}%` }}
            onClick={() => onSeek(index)}
            title={`${clipTime(line.start)} ${line.text}`}
          />
        ))}
        {version === 'source' ? <span className="th-strip-head" style={{ left: `${Math.min(100, (position / total) * 100)}%` }} /> : null}
      </div>
      <div className="th-strip-scale hw-mono">
        <span>00:00</span>
        <span>{clipTime(total / 2)}</span>
        <span>{clipTime(total)}</span>
      </div>
    </div>
  )
}

/* ── Transcript paper ─────────────────────────────── */

function Paper({ clip, selection, setSelection, activeLine, onSeek, onCut, onRestore, onQuote, busy, onTranscribe, job, showTimes }) {
  const anchor = useRef(null)
  const listRef = useRef(null)
  const cut = new Set(clip.deleted)
  const picked = new Set(selection)

  useEffect(() => {
    if (activeLine < 0) return
    const node = listRef.current?.querySelector(`[data-line="${activeLine}"]`)
    node?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' })
  }, [activeLine])

  function choose(index, event) {
    const shift = event.shiftKey && anchor.current !== null
    const meta = event.metaKey || event.ctrlKey
    let next
    if (shift) {
      const [a, b] = [Math.min(anchor.current, index), Math.max(anchor.current, index)]
      next = new Set(selection)
      for (let i = a; i <= b; i += 1) next.add(i)
    } else if (meta) {
      next = new Set(selection)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      anchor.current = index
    } else {
      next = new Set([index])
      anchor.current = index
    }
    setSelection([...next].sort((x, y) => x - y))
    onSeek(index)
  }

  if (!clip.transcript.length) {
    const running = job?.status === 'running' && job.kind === 'transcribe'
    return (
      <div className="th-paper is-empty">
        <div className="th-empty">
          <span className="th-empty-mark" aria-hidden="true"><Icon name="wave" size={22} /></span>
          <h3>{running ? '正在识别文稿…' : '先把原声变成文稿'}</h3>
          <p>{running ? '本地 faster-whisper 在逐句识别，不上传任何内容。' : '识别完成后，每一句都能点选、删除、恢复，或者引用给助手改。'}</p>
          {running ? <span className="th-progress" aria-hidden="true" /> : (
            <button type="button" className="hw-cta" onClick={onTranscribe} disabled={busy}>
              识别文稿
              <Icon name="arrow" size={15} />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="th-paper">
      <ol className="th-lines" ref={listRef} aria-label="文稿">
        {clip.transcript.map((line, index) => {
          const isCut = cut.has(index)
          const isPicked = picked.has(index)
          return (
            <li key={index} data-line={index}>
              <button
                type="button"
                className={`th-line ${isCut ? 'is-cut' : ''} ${isPicked ? 'is-picked' : ''} ${index === activeLine ? 'is-active' : ''}`}
                aria-pressed={isPicked}
                onClick={event => choose(index, event)}
              >
                {showTimes ? <span className="th-line-time hw-mono">{clipTime(line.start)}</span> : null}
                <span className="th-line-text">{line.text}</span>
                {isCut ? <span className="th-line-tag">已删</span> : null}
              </button>
            </li>
          )
        })}
      </ol>

      <div className={`th-selbar ${selection.length ? 'is-on' : ''}`} aria-hidden={!selection.length}>
        <span className="th-selbar-count"><b>{selection.length}</b> 句 · {clipTime(clip.transcript[selection[0]]?.start ?? 0)}–{clipTime(clip.transcript[selection.at(-1)]?.end ?? 0)}</span>
        <button type="button" className="th-selbar-btn" onClick={onQuote} tabIndex={selection.length ? 0 : -1}>
          <Icon name="quote" size={13} />引用给助手<kbd>Q</kbd>
        </button>
        {selection.some(index => !cut.has(index)) ? (
          <button type="button" className="th-selbar-btn is-danger" onClick={onCut} disabled={busy} tabIndex={selection.length ? 0 : -1}>
            <Icon name="scissors" size={13} />删掉<kbd>⌫</kbd>
          </button>
        ) : null}
        {selection.some(index => cut.has(index)) ? (
          <button type="button" className="th-selbar-btn" onClick={onRestore} disabled={busy} tabIndex={selection.length ? 0 : -1}>
            <Icon name="undo" size={13} />恢复
          </button>
        ) : null}
        <button type="button" className="hw-icon-btn is-tiny" onClick={() => setSelection([])} aria-label="取消选择" tabIndex={selection.length ? 0 : -1}>
          <Icon name="x" size={11} />
        </button>
      </div>
    </div>
  )
}

/* ── Style picker ─────────────────────────────────── */

function StyleCover({ api, style }) {
  const [src, setSrc] = useState(STYLE_COVERS.get(style.id) ?? '')
  const ref = useRef(null)
  useEffect(() => {
    if (src) return undefined
    const node = ref.current
    let alive = true
    const io = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      io.disconnect()
      api.clip('style_preview', { styleId: style.id }).then(result => {
        STYLE_COVERS.set(style.id, result.source)
        if (alive) setSrc(result.source)
      }).catch(() => {})
    }, { rootMargin: '120px' })
    if (node) io.observe(node)
    return () => { alive = false; io.disconnect() }
  }, [api, style.id, src])
  return (
    <span className="th-style-cover" ref={ref}>
      {src ? <img src={src} alt="" loading="lazy" /> : <i aria-hidden="true" />}
    </span>
  )
}

function StyleDialog({ api, clip, onClose, onSaved }) {
  const [catalog, setCatalog] = useState(null)
  const [query, setQuery] = useState('')
  const current = clip.visualPreferences ?? {}
  const [styleId, setStyleId] = useState(current.style?.id ?? null)
  const [branchId, setBranchId] = useState(current.branch?.id ?? '')
  const [orchestrationId, setOrchestrationId] = useState(current.orchestration?.id ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef(null)
  useDismiss(ref, true, () => { if (!saving) onClose() })

  useEffect(() => {
    api.clip('styles').then(setCatalog).catch(reason => setError(messageFor(reason)))
  }, [api])

  const styles = useMemo(() => {
    const text = query.trim().toLowerCase()
    return (catalog?.styles ?? []).filter(style => !text || `${style.name} ${style.familyName} ${style.definition}`.toLowerCase().includes(text))
  }, [catalog, query])
  const branches = (catalog?.branches ?? []).filter(branch => branch.familyId === styleId)
  const chosen = catalog?.styles?.find(style => style.id === styleId)

  async function save() {
    setSaving(true)
    setError('')
    try {
      const result = await api.clip('art_style', {
        projectId: clip.id, revision: clip.revision, operationId: operationId('style'),
        styleId, branchId: branchId || null, orchestrationId: orchestrationId || null,
      })
      onSaved(result.project)
    } catch (reason) {
      setError(messageFor(reason))
      setSaving(false)
    }
  }

  return (
    <div className="hw-modal-scrim">
      <div className="hw-modal th-style-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="th-style-title">
        <div className="hw-modal-head">
          <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />母画风</p>
          <button type="button" className="hw-icon-btn" onClick={onClose} aria-label="关闭（Esc）"><Icon name="x" size={15} /></button>
        </div>
        <div className="th-style-top">
          <h2 id="th-style-title">这条口播长什么样？</h2>
          <label className="hw-search th-style-search">
            <Icon name="search" size={13} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="搜画风，比如 水墨、几何" aria-label="搜索画风" />
          </label>
        </div>

        <div className="th-style-grid" role="radiogroup" aria-label="母画风">
          <button type="button" role="radio" aria-checked={styleId === null} className={`th-style-card is-auto ${styleId === null ? 'is-on' : ''}`} onClick={() => { setStyleId(null); setBranchId('') }}>
            <span className="th-style-cover"><span className="th-style-auto"><Icon name="spark" size={20} /></span></span>
            <b>自动推荐</b>
            <span>按这条口播的内容挑</span>
          </button>
          {catalog ? styles.map((style, index) => (
            <button
              key={style.id}
              type="button"
              role="radio"
              aria-checked={styleId === style.id}
              className={`th-style-card ${styleId === style.id ? 'is-on' : ''}`}
              style={{ '--i': index }}
              onClick={() => { setStyleId(style.id); setBranchId('') }}
            >
              <StyleCover api={api} style={style} />
              <b>{style.name}</b>
              <span>{style.visualMechanism}</span>
            </button>
          )) : Array.from({ length: 8 }, (_, i) => <span key={i} className="th-style-card is-ghost" aria-hidden="true" />)}
        </div>

        <div className="th-style-foot">
          <div className="th-style-detail">
            {chosen ? (
              <>
                <b>{chosen.name}</b>
                <p>{chosen.definition}</p>
              </>
            ) : <p>自动推荐会在制作前按文稿内容挑一套母画风。</p>}
          </div>
          <div className="th-style-pickers">
            {branches.length ? (
              <label className="hw-field">
                <span>分支</span>
                <select value={branchId} onChange={event => setBranchId(event.target.value)}>
                  <option value="">不指定</option>
                  {branches.map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                </select>
              </label>
            ) : null}
            <label className="hw-field">
              <span>编排</span>
              <select value={orchestrationId} onChange={event => setOrchestrationId(event.target.value)}>
                <option value="">跟随内容</option>
                {(catalog?.orchestrations ?? []).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
          </div>
          {error ? <p className="hw-modal-error" role="alert">{error}</p> : null}
          <button type="button" className="hw-cta" onClick={save} disabled={saving || !catalog}>
            {saving ? <span className="hw-spinner is-light" aria-hidden="true" /> : null}
            用这套
            {saving ? null : <Icon name="arrow" size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Image assets ─────────────────────────────────── */

const PURPOSES = [
  { id: 'scene', label: '场景' }, { id: 'object', label: '物件' }, { id: 'background', label: '背景' },
  { id: 'texture', label: '纹理' }, { id: 'comparison', label: '对比' }, { id: 'detail', label: '细节' },
]

function AssetThumb({ api, clip, asset }) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    if (asset.status !== 'ready') return undefined
    let alive = true
    api.clip('image_preview', { projectId: clip.id, assetId: asset.id }).then(result => { if (alive) setSrc(result.source) }).catch(() => {})
    return () => { alive = false }
  }, [api, clip.id, asset.id, asset.status])
  return src ? <img src={src} alt="" /> : <i aria-hidden="true" className={`th-asset-ph is-${asset.status}`} />
}

function AssetsDialog({ api, clip, onClose, onAsk }) {
  const [assets, setAssets] = useState(null)
  const [settings, setSettings] = useState(null)
  const [error, setError] = useState('')
  const ref = useRef(null)
  useDismiss(ref, true, () => onClose())

  const load = useCallback(() => {
    api.clip('images_list', { projectId: clip.id }).then(setAssets).catch(reason => setError(messageFor(reason)))
    api.clip('image_settings').then(result => setSettings(result.settings)).catch(reason => setError(messageFor(reason)))
  }, [api, clip.id])
  useEffect(() => { load() }, [load])
  // Keys are edited in DSH settings; re-read when that panel closes.
  useEffect(() => {
    const onFocus = () => api.clip('image_settings').then(result => setSettings(result.settings)).catch(() => {})
    let open = false
    const observer = new MutationObserver(() => {
      const now = Boolean(document.querySelector('[data-media-providers-icon]'))
      if (open && !now) onFocus()
      open = now
    })
    observer.observe(document.body, { childList: true })
    return () => observer.disconnect()
  }, [api])

  function openHub() {
    if (!openKeySettings({ kind: 'image', provider: 'seedream' })) setError('没有找到「接口与密钥」插件；请先在插件管理里启用它。')
  }

  const list = assets?.assets ?? []
  return (
    <div className="hw-modal-scrim">
      <div className="hw-modal th-assets-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="th-assets-title">
        <div className="hw-modal-head">
          <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />本片素材</p>
          <button type="button" className="hw-icon-btn" onClick={onClose} aria-label="关闭（Esc）"><Icon name="x" size={15} /></button>
        </div>
        <h2 id="th-assets-title">画面素材与生图</h2>
        <div className="th-assets-bar">
          <p className="th-assets-count"><b>{assets ? list.length : '–'}</b> 张素材{list.some(item => item.active) ? <span> · 在用 {list.filter(item => item.active).length}</span> : null}</p>
        <button type="button" className="th-assets-model" onClick={openHub} title="生图模型与密钥（设置 → 接口与密钥）">
          <span className={`hw-status-dot ${settings?.configured ? 'is-ok' : 'is-warn'}`} aria-hidden="true" />
          {!settings ? '生图模型' : settings.configured ? (settings.product || 'Seedream') : '连接生图模型'}
          <Icon name="arrow" size={12} />
        </button>
        </div>

        {list.length ? (
            <ul className="th-asset-grid">
              {list.map(asset => (
                <li key={asset.id} className={`th-asset ${asset.active ? 'is-active' : ''}`}>
                  <span className="th-asset-img"><AssetThumb api={api} clip={clip} asset={asset} /></span>
                  <b>{asset.title}</b>
                  <span>{PURPOSES.find(item => item.id === asset.purpose)?.label ?? asset.purpose} · {asset.ratio} · {asset.status === 'ready' ? (asset.active ? '在用' : '备选') : asset.status === 'failed' ? '失败' : '生成中'}</span>
                  <button type="button" className="hw-text-btn" onClick={() => { onAsk(`重做素材「${asset.title}」（${asset.id}）：`); onClose() }}>让助手重做</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="hw-empty th-assets-empty">
              <span className="th-empty-mark" aria-hidden="true"><Icon name="image" size={20} /></span>
              <div>
                <h3>还没有生成素材</h3>
                <p>制作整片时助手会按文稿设计需要的画面再生图；也可以直接告诉它要什么。</p>
                {settings && !settings.configured ? (
                  <button type="button" className="hw-text-btn" onClick={openHub}>先连接生图模型<Icon name="arrow" size={13} /></button>
                ) : null}
                <button type="button" className="hw-text-btn is-strong" onClick={() => { onAsk('按这条口播的内容，设计 3 张最需要的画面素材，先列出来给我确认，再生成。'); onClose() }}>
                  让助手设计素材<Icon name="arrow" size={13} />
                </button>
              </div>
            </div>
          )}
        {error ? <p className="hw-modal-error" role="alert">{error}</p> : null}
      </div>
    </div>
  )
}

/* ── Import ───────────────────────────────────────── */

function ImportDialog({ api, onClose, onImported }) {
  const [file, setFile] = useState(null)
  const [name, setName] = useState('')
  const [owned, setOwned] = useState(false)
  const [progress, setProgress] = useState(-1)
  const [error, setError] = useState('')
  const [drag, setDrag] = useState(false)
  const controller = useRef(null)
  const ref = useRef(null)
  const busy = progress >= 0
  useDismiss(ref, true, () => { if (!busy) onClose() })

  function pick(next) {
    if (!next) return
    if (!/^video\//.test(next.type) && !/\.(mp4|mov|m4v|webm|mkv)$/i.test(next.name)) { setError('请选一个视频文件'); return }
    setFile(next)
    setError('')
    if (!name) setName(next.name.replace(/\.[^.]+$/, ''))
  }

  async function upload() {
    if (!file || !owned || busy) return
    setError('')
    setProgress(0)
    const abort = new AbortController()
    controller.current = abort
    let uploadId = ''
    try {
      const begin = await api.clip('upload_begin', { size: file.size })
      uploadId = begin.uploadId
      for (let offset = 0; offset < file.size;) {
        abort.signal.throwIfAborted()
        const bytes = new Uint8Array(await file.slice(offset, offset + begin.chunkSize).arrayBuffer())
        let binary = ''
        for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
        const part = await api.clip('upload_chunk', { uploadId, offset, data: btoa(binary) })
        offset = part.next
        setProgress(offset / file.size)
      }
      setProgress(1)
      const result = await api.clip('upload_finish', { uploadId, filename: file.name, name: name.trim() || file.name, owned: true })
      onImported(result.project)
    } catch (reason) {
      if (uploadId) api.clip('upload_cancel', { uploadId }).catch(() => {})
      if (!abort.signal.aborted) setError(messageFor(reason))
      setProgress(-1)
    }
  }

  return (
    <div className="hw-modal-scrim">
      <div className="hw-modal th-import-modal" ref={ref} role="dialog" aria-modal="true" aria-labelledby="th-import-title">
        <div className="hw-modal-head">
          <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />导入口播</p>
          <button type="button" className="hw-icon-btn" onClick={() => { controller.current?.abort(); onClose() }} aria-label="关闭（Esc）"><Icon name="x" size={15} /></button>
        </div>
        <h2 id="th-import-title">放一条你自己的口播进来</h2>
        <label
          className={`th-drop ${drag ? 'is-drag' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={event => { event.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={event => { event.preventDefault(); setDrag(false); pick(event.dataTransfer.files?.[0]) }}
        >
          <input type="file" accept="video/*,.mp4,.mov,.m4v,.webm,.mkv" onChange={event => pick(event.target.files?.[0])} disabled={busy} />
          <span className="th-drop-icon" aria-hidden="true"><Icon name={file ? 'film' : 'upload'} size={22} /></span>
          {file ? (
            <>
              <b>{file.name}</b>
              <span className="hw-mono">{(file.size / 1024 / 1024).toFixed(1)} MB · 点这里换一个</span>
            </>
          ) : (
            <>
              <b>拖进来，或点这里选文件</b>
              <span>MP4 / MOV，最长 60 分钟，不超过 2 GB</span>
            </>
          )}
          {busy ? <span className="th-drop-bar" style={{ '--p': progress }} aria-hidden="true" /> : null}
        </label>
        <label className="hw-input-block">
          <span>名字</span>
          <input value={name} onChange={event => setName(event.target.value)} placeholder="比如 普通人的三个财经底线" maxLength={160} disabled={busy} />
        </label>
        <label className="th-check">
          <input type="checkbox" checked={owned} onChange={event => setOwned(event.target.checked)} disabled={busy} />
          <span className="th-check-box" aria-hidden="true"><Icon name="check" size={10} stroke={2.4} /></span>
          <span>这是我自己拍的口播，有权剪辑和再创作。</span>
        </label>
        {error ? <p className="hw-modal-error" role="alert">{error}</p> : null}
        <div className="hw-modal-foot">
          <span>{busy ? `正在传入 ${Math.round(progress * 100)}%` : '视频复制到本机工作台目录，原文件不动。'}</span>
          <button type="button" className="hw-cta" onClick={upload} disabled={!file || !owned || busy}>
            {busy ? <span className="hw-spinner is-light" aria-hidden="true" /> : null}
            {busy ? '导入中' : '导入'}
            {busy ? null : <Icon name="arrow" size={15} />}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Environment ──────────────────────────────────── */

function EnvPop({ env }) {
  const rows = [
    { key: 'ffmpeg', label: '剪辑 ffmpeg', fix: 'brew install ffmpeg' },
    { key: 'python', label: 'Python · faster-whisper', fix: 'pip3 install -r requirements-macos.txt' },
    { key: 'asr', label: '识别模型', fix: 'python3 -c "from faster_whisper import WhisperModel; WhisperModel(\'small\')"' },
  ]
  return (
    <div className="hw-pop hw-pop-env" role="dialog" aria-label="口播环境">
      <p className="hw-pop-title">口播环境</p>
      {rows.map(row => {
        const item = env?.[row.key]
        return (
          <div className="hw-env-row" key={row.key}>
            <span className={`hw-env-mark ${item?.ok ? 'is-ok' : 'is-warn'}`} aria-hidden="true" />
            <span className="hw-env-label">{row.label}</span>
            <b>{!env ? '检查中' : item?.ok ? '就绪' : '缺少'}</b>
            {env && !item?.ok ? <code className="th-env-fix">{row.fix}</code> : null}
          </div>
        )
      })}
      <p className="hw-pop-foot-note">识别、剪辑都在本机完成；只有生图会调用你配置的服务。</p>
    </div>
  )
}

/* ── Clip switcher ────────────────────────────────── */

function ClipSwitch({ clips, selected, onSelect, onImport }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))
  const index = Math.max(0, clips.findIndex(item => item.id === selected))
  const current = clips[index]
  return (
    <div className="hw-switch" ref={ref}>
      <span className="hw-switch-slash" aria-hidden="true">/</span>
      <button type="button" className={`hw-switch-btn ${open ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(value => !value)}>
        <span className={`hw-dot ${current?.versions ? 'is-review' : current?.lines ? 'is-render' : 'is-write'}`} aria-hidden="true" />
        <span className="hw-switch-name">{current?.name ?? '选择口播'}</span>
        <span className="hw-switch-count">{pad(index + 1)}/{pad(clips.length)}</span>
        <Icon name="chevronDown" size={12} />
      </button>
      {open ? (
        <div className="hw-pop hw-switch-pop" role="dialog" aria-label="切换口播">
          <p className="hw-pop-title">口播 · {pad(clips.length)}</p>
          <ul className="hw-switch-list" role="listbox" aria-label="口播">
            {clips.map((clip, position) => (
              <li key={clip.id}>
                <button type="button" role="option" aria-selected={clip.id === selected} className={`hw-switch-item ${clip.id === selected ? 'is-on' : ''}`} onClick={() => { onSelect(clip.id); setOpen(false) }}>
                  <span className="hw-switch-index">{pad(position + 1)}</span>
                  <span className="hw-switch-main">
                    <b>{clip.name}</b>
                    <span>{clipTime(clip.duration)} · {clip.lines ? `${clip.lines} 句` : '未识别'} · {clip.versions} 个版本</span>
                  </span>
                  {clip.style ? <span className="hw-tag is-render">{clip.style.name}</span> : null}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="hw-switch-new" onClick={() => { setOpen(false); onImport() }}>
            <span className="hw-switch-new-icon"><Icon name="plus" size={13} stroke={2} /></span>
            导入口播
            <kbd>I</kbd>
          </button>
        </div>
      ) : null}
    </div>
  )
}

/* ── Landing (no clips yet) ───────────────────────── */

function Landing({ env, onImport }) {
  const steps = [
    { n: '01', t: '导入原片', d: '你自己拍的口播，复制进本机工作台。' },
    { n: '02', t: '识别成文稿', d: '本地 faster-whisper 逐句识别，可点选、删改。' },
    { n: '03', t: '剪掉废话', d: '删句、恢复，一键出剪辑版本，原声不动。' },
    { n: '04', t: '做成整片', d: '选一套母画风，助手按文稿设计画面并渲染。' },
  ]
  return (
    <div className="th-landing">
      <div className="th-landing-copy">
        <p className="hw-next-kicker"><span className="hw-next-rec" aria-hidden="true" />网感口播</p>
        <h2>用文稿剪口播，<br />用一句话做整片。</h2>
        <p className="th-landing-lead">原声和真人画面全程保留。删句就是剪辑；想要画面、字幕和节奏，对助手说一句。</p>
        <button type="button" className="hw-cta" onClick={onImport}>
          导入第一条口播
          <Icon name="arrow" size={15} />
        </button>
        {env && (!env.ffmpeg?.ok || !env.python?.ok) ? (
          <p className="th-landing-warn"><span className="hw-status-dot is-warn" aria-hidden="true" />本机还缺 {[!env.ffmpeg?.ok && 'ffmpeg', !env.python?.ok && 'Python / faster-whisper'].filter(Boolean).join('、')}，右上角「环境」里有安装命令。</p>
        ) : null}
      </div>
      <ol className="th-landing-steps">
        {steps.map((step, index) => (
          <li key={step.n} style={{ '--i': index }}>
            <span className="hw-mono">{step.n}</span>
            <b>{step.t}</b>
            <p>{step.d}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── Studio ───────────────────────────────────────── */

export function TalkingHeadStudio({ api, header }) {
  const [clips, setClips] = useState(null)
  const [selected, setSelected] = useState(() => { try { return globalThis.localStorage?.getItem(CLIP_KEY) ?? '' } catch { return '' } })
  const [clip, setClip] = useState(null)
  const [job, setJob] = useState(null)
  const [version, setVersion] = useState('source')
  const [selection, setSelection] = useState([])
  const [position, setPosition] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null)
  const [dialog, setDialog] = useState('')
  const [env, setEnv] = useState(null)
  const [envOpen, setEnvOpen] = useState(false)
  const [pendingPrompt, setPendingPrompt] = useState(null)
  const [attachment, setAttachment] = useState(null)
  const [showTimes, setShowTimes] = useState(true)
  const [view, setView] = useState('edit')
  const [filmFocus, setFilmFocus] = useState('')
  const [loadError, setLoadError] = useState('')
  const videoRef = useRef(null)
  const envRef = useRef(null)
  useDismiss(envRef, envOpen, () => setEnvOpen(false))
  const versionCount = useRef(0)

  const refreshList = useCallback(async () => {
    try {
      const result = await api.clip('list')
      setClips(result.projects)
      setLoadError('')
      setSelected(previous => (result.projects.some(item => item.id === previous) ? previous : result.projects[0]?.id ?? ''))
      return result.projects
    } catch (reason) {
      setLoadError(messageFor(reason))
      setClips([])
      return []
    }
  }, [api])

  const refreshClip = useCallback(async id => {
    if (!id) { setClip(null); return }
    try {
      const result = await api.clip('status', { projectId: id })
      setClip(previous => (previous && previous.id === id && previous.revision === result.project.revision ? previous : result.project))
      setJob(result.job)
      return result
    } catch (reason) {
      setNotice({ kind: 'error', text: messageFor(reason) })
    }
  }, [api])

  useEffect(() => { void refreshList() }, [refreshList])
  useEffect(() => { api.clip('environment').then(setEnv).catch(() => setEnv({})) }, [api])

  useEffect(() => {
    if (!selected) return undefined
    try { globalThis.localStorage?.setItem(CLIP_KEY, selected) } catch {}
    setClip(null)
    setView('edit')
    setFilmFocus('')
    setSelection([])
    setAttachment(null)
    setPosition(0)
    void refreshClip(selected).then(result => {
      const project = result?.project
      versionCount.current = project?.versions.length ?? 0
      setVersion(project?.versions.at(-1)?.id ?? 'source')
    })
    return undefined
  }, [selected, refreshClip])

  // Poll while a job runs, and lightly otherwise so agent edits show up.
  useEffect(() => {
    if (!selected) return undefined
    const running = job?.status === 'running'
    const timer = setInterval(() => { void refreshClip(selected) }, running ? 1500 : 5000)
    return () => clearInterval(timer)
  }, [selected, job?.status, refreshClip])

  // A new version arrived (render or adopt): switch to it.
  useEffect(() => {
    if (!clip) return
    if (clip.versions.length > versionCount.current) {
      setVersion(clip.versions.at(-1).id)
      setNotice({ kind: 'success', text: `「${clip.versions.at(-1).label}」好了，去「成片」里看。` })
      setFilmFocus(clip.versions.at(-1).id)
    }
    versionCount.current = clip.versions.length
  }, [clip?.versions.length])

  useEffect(() => { setSelection([]) }, [clip?.revision])

  const activeLine = useMemo(() => {
    if (!clip || version !== 'source') return -1
    return clip.transcript.findIndex(line => position >= line.start && position < line.end)
  }, [clip, position, version])

  const seek = useCallback(index => {
    if (!clip) return
    const start = clip.transcript[index]?.start ?? 0
    setVersion('source')
    setPosition(start)
    requestAnimationFrame(() => {
      const node = videoRef.current
      if (node) { node.pause(); node.currentTime = start }
    })
  }, [clip])

  async function mutate(op, input, success) {
    if (!clip) return
    setBusy(true)
    try {
      const result = await api.clip(op, { projectId: clip.id, revision: clip.revision, operationId: operationId(op), ...input })
      if (result.project) setClip(result.project)
      if (result.job) setJob(result.job)
      if (success) setNotice({ kind: 'success', text: success })
      void refreshList()
    } catch (reason) {
      setNotice({ kind: 'error', text: messageFor(reason) })
      void refreshClip(clip.id)
    } finally {
      setBusy(false)
    }
  }

  const cutSelection = () => mutate('edit', { action: 'cut', indices: selection }, `删掉了 ${selection.length} 句，出剪辑版本前随时可以恢复。`)
  const restoreSelection = () => mutate('edit', { action: 'restore', indices: selection }, '恢复了。')
  const transcribe = () => mutate('transcribe', {}, '开始识别文稿，几十秒到几分钟。')
  const render = () => mutate('render', {}, '开始出剪辑版本。')
  const cancelJob = () => job && api.clip('cancel', { projectId: clip.id, jobId: job.id }).then(result => setJob(result.job)).catch(() => {})

  const quote = useCallback(() => {
    if (!clip || !selection.length) return
    const lines = selection.map(index => clip.transcript[index])
    const span = `${clipTime(lines[0].start, true)}–${clipTime(lines.at(-1).end, true)}`
    setAttachment({
      label: `${selection.length} 句原文 · ${span}`,
      context: `【引用原句】${span}\n${selection.map(index => `[${index}] ${clipTime(clip.transcript[index].start, true)} ${clip.transcript[index].text}`).join('\n')}`,
    })
    setPendingPrompt({ for: clip.id, text: '' })
  }, [clip, selection])

  // Keyboard: ⌫ cut · ⇧⌫ restore · Q quote · Space play · Esc clear · I import
  useEffect(() => {
    function onKey(event) {
      const t = event.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return
      if (dialog) return
      if (event.key === 'i' || event.key === 'I') { if (!event.metaKey && !event.ctrlKey) { event.preventDefault(); setDialog('import') } return }
      if (!clip) return
      if (event.key === 'Escape' && selection.length) { setSelection([]); return }
      if (event.key === ' ' && !event.metaKey) {
        event.preventDefault()
        const node = videoRef.current
        if (node) node.paused ? void node.play().catch(() => {}) : node.pause()
        return
      }
      if (!selection.length) return
      if ((event.key === 'Backspace' || event.key === 'Delete') && !busy) {
        event.preventDefault()
        if (event.shiftKey) void restoreSelection()
        else void cutSelection()
      }
      if (event.key === 'q' || event.key === 'Q') { event.preventDefault(); quote() }
    }
    globalThis.document?.addEventListener('keydown', onKey)
    return () => globalThis.document?.removeEventListener('keydown', onKey)
  })

  const chatApi = useMemo(() => (clip ? api.chatFor({ clip: clip.id }) : null), [api, clip?.id])
  const consume = useCallback(() => setPendingPrompt(null), [])
  const turnDone = useCallback(() => { if (selected) void refreshClip(selected) }, [selected, refreshClip])
  const ask = useCallback(text => setPendingPrompt({ text }), [])

  const running = job?.status === 'running'
  const cutCount = clip?.deleted.length ?? 0
  const cutSeconds = clip ? clip.deleted.reduce((sum, index) => sum + (clip.transcript[index] ? clip.transcript[index].end - clip.transcript[index].start : 0), 0) : 0
  const lastRenderRevision = clip?.versions.filter(item => item.label?.startsWith('剪辑版本')).at(-1)?.revision ?? -1
  const editsPending = clip && cutCount > 0 && clip.revision > lastRenderRevision + 1
  const style = clip?.visualPreferences?.style
  const envWarn = env && (!env.ffmpeg?.ok || !env.python?.ok || !env.asr?.ok)

  const topRight = (
    <div className="hw-top-right" ref={envRef}>
      {clip ? (
        <div className="th-views" role="tablist" aria-label="视图">
          <button type="button" role="tab" aria-selected={view === 'edit'} className={`th-view ${view === 'edit' ? 'is-on' : ''}`} onClick={() => setView('edit')}>
            <Icon name="scissors" size={13} /><span className="hw-pill-label">剪辑</span>
          </button>
          <button type="button" role="tab" aria-selected={view === 'films'} className={`th-view ${view === 'films' ? 'is-on' : ''}`} onClick={() => setView('films')}>
            <Icon name="film" size={13} /><span className="hw-pill-label">成片</span>{clip.versions.length ? <span className="th-view-count hw-mono">{clip.versions.length}</span> : null}
            {filmFocus && view !== 'films' ? <span className="th-view-new" aria-label="有新成片" /> : null}
          </button>
        </div>
      ) : null}
      {clip ? (
        <>
          <button type="button" className="hw-pill-btn" onClick={() => setDialog('style')}>
            <Icon name="palette" size={14} />
            <span className="hw-pill-label">{style ? style.name : '画风：自动'}</span>
          </button>
          <button type="button" className="hw-pill-btn" onClick={() => setDialog('assets')}>
            <Icon name="image" size={14} />
            <span className="hw-pill-label">素材</span>
          </button>
        </>
      ) : null}
      <button type="button" className={`hw-pill-btn ${envOpen ? 'is-open' : ''}`} aria-expanded={envOpen} onClick={() => setEnvOpen(value => !value)}>
        <span className={`hw-status-dot ${!env ? '' : envWarn ? 'is-warn' : 'is-ok'}`} aria-hidden="true" />
        <span className="hw-pill-label">{!env ? '检查环境' : envWarn ? '环境待补' : '环境'}</span>
      </button>
      {envOpen ? <div className="hw-pop-anchor"><EnvPop env={env} /></div> : null}
    </div>
  )

  return (
    <div className="hw-studio th-studio">
      <header className="hw-top">
        {header}
        {clips?.length ? <ClipSwitch clips={clips} selected={selected} onSelect={setSelected} onImport={() => setDialog('import')} /> : null}
        {topRight}
      </header>

      <div className="hw-toasts th-toasts">
        {notice ? <Toast text={notice.text} kind={notice.kind} onClose={() => setNotice(null)} /> : null}
      </div>

      {clips === null ? (
        <div className="hw-skeleton" aria-hidden="true"><i style={{ width: 160, height: 10 }} /><i style={{ width: '40%', height: 34, marginTop: 14 }} /></div>
      ) : !clips.length ? (
        <Landing env={env} onImport={() => setDialog('import')} />
      ) : !clip ? (
        <div className="hw-state">{loadError ? <p>{loadError}</p> : <span className="hw-spinner" aria-hidden="true" />}</div>
      ) : (
        <div className={`th-shell ${view === 'films' ? 'is-films' : ''}`}>
          {view === 'films' ? (
            <main className="th-films-main">
              <FilmsView api={api} clip={clip} onAsk={ask} initial={filmFocus} />
            </main>
          ) : (
          <>
          <div className="th-left">
            <Monitor
              api={api}
              clip={clip}
              version={version}
              onVersion={value => { setVersion(value); setPosition(0); setPlaying(false) }}
              videoRef={videoRef}
              position={position}
              onTime={setPosition}
              playing={playing}
              onPlaying={setPlaying}
            />
            {clip.transcript.length ? (
              <Strip clip={clip} deleted={clip.deleted} position={position} version={version} onSeek={seek} selection={selection} />
            ) : null}
          </div>

          <main className="th-center">
            <div className="th-head">
              <div className="th-head-main">
                <p className="th-head-meta hw-mono">
                  {clipTime(clip.duration)} · {clip.width}×{clip.height} · {clip.transcript.length ? `${clip.transcript.length} 句` : '未识别'}
                  {cutCount ? <em> · 已删 {cutCount} 句 / {cutSeconds.toFixed(1)}s</em> : null}
                </p>
                <h1>{clip.name}</h1>
              </div>
              <div className="th-head-actions">
                {clip.transcript.length ? (
                  <button type="button" className={`hw-icon-btn ${showTimes ? 'is-on' : ''}`} onClick={() => setShowTimes(value => !value)} title={showTimes ? '隐藏时间码' : '显示时间码'} aria-label="时间码">
                    <Icon name="clock" size={15} />
                  </button>
                ) : null}
                {clip.transcript.length ? (
                  <button
                    type="button"
                    className={`hw-cta is-small ${editsPending ? '' : 'is-quiet'}`}
                    onClick={render}
                    disabled={busy || running || !cutCount}
                    title={cutCount ? '按删改结果出一个剪辑版本' : '先删掉一些句子'}
                  >
                    <Icon name="scissors" size={13} />
                    出剪辑版本
                  </button>
                ) : null}
              </div>
            </div>

            {running ? (
              <div className="th-job" role="status">
                <span className="th-job-bar" aria-hidden="true" />
                <span>{{ transcribe: '正在识别文稿', render: '正在出剪辑版本', studio: '正在制作整片', generate_images: '正在生成素材' }[job.kind] ?? '任务进行中'}</span>
                <span className="hw-mono th-job-log">{(job.log ?? '').trim().split('\n').at(-1)?.slice(0, 80)}</span>
                <button type="button" className="hw-text-btn" onClick={cancelJob}>取消</button>
              </div>
            ) : job?.status === 'failed' && Date.now() - Date.parse(job.finishedAt ?? 0) < 120000 ? (
              <div className="th-job is-bad" role="alert">
                <span>{job.kind === 'transcribe' ? '识别失败' : '任务失败'}：{lastLines(job.error, 2)}</span>
                <button type="button" className="hw-text-btn is-strong" onClick={() => ask(`刚才的任务失败了：${lastLines(job.error, 6)}\n帮我看看原因，能修就修。`)}>问助手</button>
              </div>
            ) : null}

            <Paper
              clip={clip}
              selection={selection}
              setSelection={setSelection}
              activeLine={activeLine}
              onSeek={seek}
              onCut={cutSelection}
              onRestore={restoreSelection}
              onQuote={quote}
              busy={busy || running}
              onTranscribe={transcribe}
              job={job}
              showTimes={showTimes}
            />
          </main>
          </>
          )}

          {chatApi ? (
            <Assistant
              key={clip.id}
              className="th-assistant"
              target={{
                id: clip.id,
                title: clip.name,
                hint: clip.name,
                kicker: style ? `画风 · ${style.name}` : `只为「${clip.name}」工作`,
                heading: clip.transcript.length ? '想怎么改，直接说。' : '先识别文稿，再聊怎么剪。',
                body: '选中文稿里的句子按 Q 引用过来，说清楚要怎么改；它能删句、出版本、按画风做整片，花钱的生图会先问你。',
                prompts: clip.transcript.length ? [
                  '通读文稿，指出可以删掉的口误、重复和废话，先列给我确认',
                  `按${style ? `「${style.name}」` : '内容自选'}画风做一版完整视频，保留原声`,
                  '给这条口播起 3 个标题，并说明各自的钩子',
                ] : ['帮我识别文稿，然后告诉我这条口播在讲什么'],
              }}
              chat={chatApi}
              pendingPrompt={pendingPrompt}
              onConsume={consume}
              onTurnDone={turnDone}
              attachment={attachment}
              onClearAttachment={() => setAttachment(null)}
            />
          ) : null}
        </div>
      )}

      {dialog === 'import' ? (
        <ImportDialog
          api={api}
          onClose={() => setDialog('')}
          onImported={async project => {
            setDialog('')
            await refreshList()
            setSelected(project.id)
            setNotice({ kind: 'success', text: `「${project.name}」已导入。先识别文稿吧。` })
          }}
        />
      ) : null}
      {dialog === 'style' && clip ? (
        <StyleDialog api={api} clip={clip} onClose={() => setDialog('')} onSaved={project => {
          setClip(project)
          setDialog('')
          void refreshList()
          setPendingPrompt({ for: project.id, text: stylePrompt(project.visualPreferences), replace: true })
          setNotice({ kind: 'success', text: project.visualPreferences?.style ? `画风换成「${project.visualPreferences.style.name}」，制作提示已填进对话框，看一眼就能发送。` : '画风改为自动推荐，制作提示已填进对话框。' })
        }} />
      ) : null}
      {dialog === 'assets' && clip ? <AssetsDialog api={api} clip={clip} onClose={() => setDialog('')} onAsk={ask} /> : null}
    </div>
  )
}
