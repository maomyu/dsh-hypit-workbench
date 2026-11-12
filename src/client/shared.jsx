import React, { useCallback, useEffect, useRef, useState } from 'react'

export const ICONS = {
  refresh: 'M12 5a7 7 0 1 0 6.5 4.4M12 5V2.6M12 5l2.2 2.2',
  copy: 'M8 8V6.2A1.2 1.2 0 0 1 9.2 5h7.6A1.2 1.2 0 0 1 18 6.2v7.6a1.2 1.2 0 0 1-1.2 1.2H15M4.8 9h7.4A1.2 1.2 0 0 1 13.4 10.2v7.6A1.2 1.2 0 0 1 12.2 19H4.8a1.2 1.2 0 0 1-1.2-1.2v-7.6A1.2 1.2 0 0 1 4.8 9Z',
  check: 'm4.5 10.5 4.2 4.2 8.3-8.4',
  arrow: 'M5 12h13M12.5 5.5 19 12l-6.5 6.5',
  chevron: 'm9 5 7 7-7 7',
  plus: 'M12 5v14M5 12h14',
  folder: 'M3.5 7.2A1.2 1.2 0 0 1 4.7 6h4l1.6 1.8h8A1.2 1.2 0 0 1 19.5 9v8.8A1.2 1.2 0 0 1 18.3 19H4.7a1.2 1.2 0 0 1-1.2-1.2V7.2Z',
  code: 'm8.5 8.5-4 3.5 4 3.5M15.5 8.5l4 3.5-4 3.5M13 5l-2 14',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  scan: 'M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16M8 12h8',
  send: 'M4.5 12 20 5l-5 15-3.4-6.1L4.5 12Z',
  gear: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 4v6M9 14v6',
  chevronDown: 'm6 9 6 6 6-6',
  quote: 'M6 7.5h4.5v4.5c0 2.6-1.4 4.2-4 4.8M13.5 7.5H18v4.5c0 2.6-1.4 4.2-4 4.8',
  download: 'M12 4.5v11M7.5 11l4.5 4.5 4.5-4.5M5 19.5h14',
  sound: 'M4.5 9.5h3l4-3.5v12l-4-3.5h-3zM15 9a4 4 0 0 1 0 6M17.5 6.5a7.5 7.5 0 0 1 0 11',
  mute: 'M4.5 9.5h3l4-3.5v12l-4-3.5h-3zM15.5 9.5l5 5M20.5 9.5l-5 5',
  wave: 'M3.5 12h1.5M7 8.5v7M10.5 5.5v13M14 9v6M17.5 7v10M21 11v2',
  scissors: 'M6.5 8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM6.5 20.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM8.6 7.2 19.5 18M8.6 16.8 19.5 6',
  undo: 'M8 6.5 4.5 10 8 13.5M4.5 10h9a5.5 5.5 0 0 1 0 11H11',
  spark: 'M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18',
  image: 'M4.5 5.5h15v13h-15zM4.5 15.5l4.5-4.5 4 4 2.5-2.5 4 4M15 9.5a1.2 1.2 0 1 0 0-.01',
  upload: 'M12 15.5v-11M7.5 9 12 4.5 16.5 9M5 19.5h14',
  palette: 'M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-1 1.6-2.1-.5-1.3.3-2.4 1.7-2.4h1.7a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9ZM7.5 11.5h.01M10 7.5h.01M14.5 7.5h.01',
  clock: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17ZM12 7.5V12l3 2',
  mic: 'M12 3.5a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0v-5a3 3 0 0 0-3-3ZM5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3',
  layers: 'm12 4 8.5 4.5L12 13 3.5 8.5 12 4ZM3.5 12.5 12 17l8.5-4.5M3.5 16.5 12 21l8.5-4.5',
  expand: 'M4.5 9V4.5H9M15 4.5h4.5V9M19.5 15v4.5H15M9 19.5H4.5V15',

  shield: 'M12 3.5 5 6.2v5.3c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6.2L12 3.5Z',
  shieldOk: 'M12 3.5 5 6.2v5.3c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6.2L12 3.5ZM9 12l2.2 2.2L15.5 10',
  file: 'M7 3.5h6.5L18 8v11.3a1.2 1.2 0 0 1-1.2 1.2H7.2A1.2 1.2 0 0 1 6 19.3V4.7A1.2 1.2 0 0 1 7.2 3.5ZM13.5 3.5V8H18',
  film: 'M4.5 5.5h15v13h-15zM8 5.5v13M16 5.5v13M4.5 9.5H8M4.5 14.5H8M16 9.5h3.5M16 14.5h3.5',
  doc: 'M6 4.5h12v15H6zM9 9h6M9 12h6M9 15h4',
  run: 'M5 6.5h9M5 12h14M5 17.5h7M17 4.5l2.5 2-2.5 2',
  x: 'M6.5 6.5l11 11M17.5 6.5l-11 11',
  search: 'M10.8 17.5a6.7 6.7 0 1 0 0-13.4 6.7 6.7 0 0 0 0 13.4ZM15.6 15.6 20 20',
  retry: 'M4.5 12a7.5 7.5 0 0 1 13-5.1M19.5 12a7.5 7.5 0 0 1-13 5.1M17.8 3.8v3.4h-3.4M6.2 20.2v-3.4h3.4',
  tool: 'M14.5 5.5a4 4 0 0 0-5.2 5.2L4.5 15.5l4 4 4.8-4.8a4 4 0 0 0 5.2-5.2l-2.6 2.6-2.4-.6-.6-2.4 1.6-3.6Z',
}

export function Icon({ name, size = 16, stroke = 1.6 }) {
  return (
    <svg
      className="hw-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name] ?? ICONS.arrow} />
    </svg>
  )
}

export async function copyText(text) {
  try {
    await globalThis.navigator?.clipboard?.writeText(text)
    return true
  } catch {
    return false
  }
}

/* ── Markdown ─────────────────────────────────────── */

function inlineNodes(text, keyPrefix) {
  const nodes = []
  const pattern = /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\([^)\s]+\))/g
  let last = 0
  let index = 0
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const token = match[0]
    const key = `${keyPrefix}-${index++}`
    if (token.startsWith('`')) nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    else if (token.startsWith('**')) nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      nodes.push(<a key={key} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>)
    }
    last = match.index + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function Markdown({ text }) {
  const lines = String(text ?? '').replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let index = 0
  let key = 0
  while (index < lines.length) {
    const line = lines[index]
    if (/^```/.test(line)) {
      const body = []
      index += 1
      while (index < lines.length && !/^```/.test(lines[index])) { body.push(lines[index]); index += 1 }
      index += 1
      blocks.push(<pre className="hw-md-code" key={`b${key++}`}><code>{body.join('\n')}</code></pre>)
      continue
    }
    if (!line.trim()) { index += 1; continue }
    const heading = /^(#{1,4})\s+(.*)$/.exec(line)
    if (heading) {
      const Tag = `h${Math.min(heading[1].length + 2, 6)}`
      blocks.push(<Tag className="hw-md-h" key={`b${key++}`}>{inlineNodes(heading[2], `h${key}`)}</Tag>)
      index += 1
      continue
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\s*[-*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-*]\s+/, ''))
        index += 1
      }
      blocks.push(<ul className="hw-md-list" key={`b${key++}`}>{items.map((item, i) => <li key={i}>{inlineNodes(item, `u${key}-${i}`)}</li>)}</ul>)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (index < lines.length && /^\s*\d+\.\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+\.\s+/, ''))
        index += 1
      }
      blocks.push(<ol className="hw-md-list" key={`b${key++}`}>{items.map((item, i) => <li key={i}>{inlineNodes(item, `o${key}-${i}`)}</li>)}</ol>)
      continue
    }
    if (/^>\s?/.test(line)) {
      const quote = []
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, ''))
        index += 1
      }
      blocks.push(<blockquote className="hw-md-quote" key={`b${key++}`}>{inlineNodes(quote.join(' '), `q${key}`)}</blockquote>)
      continue
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const rows = []
      while (index < lines.length && /^\s*\|.*\|\s*$/.test(lines[index])) {
        rows.push(lines[index].trim().slice(1, -1).split('|').map(cell => cell.trim()))
        index += 1
      }
      const body = rows.filter(row => !row.every(cell => /^:?-{2,}:?$/.test(cell)))
      const [head, ...rest] = body
      blocks.push(
        <div className="hw-md-table" key={`b${key++}`}>
          <table>
            {head ? <thead><tr>{head.map((cell, i) => <th key={i}>{inlineNodes(cell, `th${key}-${i}`)}</th>)}</tr></thead> : null}
            <tbody>{rest.map((row, r) => <tr key={r}>{row.map((cell, i) => <td key={i}>{inlineNodes(cell, `td${key}-${r}-${i}`)}</td>)}</tr>)}</tbody>
          </table>
        </div>,
      )
      continue
    }
    const paragraph = []
    while (index < lines.length && lines[index].trim() && !/^(#{1,4}\s|```|\s*[-*]\s|\s*\d+\.\s|>|\s*\|)/.test(lines[index])) {
      paragraph.push(lines[index])
      index += 1
    }
    blocks.push(<p className="hw-md-p" key={`b${key++}`}>{inlineNodes(paragraph.join(' '), `p${key}`)}</p>)
  }
  return <div className="hw-md">{blocks}</div>
}

/* ── 通用 ─────────────────────────────────────────── */

export const pad = value => String(value).padStart(2, '0')

export function useDismiss(ref, open, onClose) {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open) return undefined
    const doc = globalThis.document
    function onDown(event) { if (ref.current && !ref.current.contains(event.target)) close.current() }
    function onKey(event) { if (event.key === 'Escape') close.current() }
    doc?.addEventListener('pointerdown', onDown)
    doc?.addEventListener('keydown', onKey)
    return () => {
      doc?.removeEventListener('pointerdown', onDown)
      doc?.removeEventListener('keydown', onKey)
    }
  }, [ref, open])
}

export function useCopy() {
  const [copied, setCopied] = useState('')
  const timer = useRef(0)
  useEffect(() => () => clearTimeout(timer.current), [])
  const copy = useCallback(async (text, key = text) => {
    if (!(await copyText(text))) return
    setCopied(key)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(''), 1600)
  }, [])
  return [copied, copy]
}

export function splitRel(rel) {
  const text = String(rel ?? '')
  const cut = text.lastIndexOf('/')
  return cut < 0 ? ['', text] : [text.slice(0, cut + 1), text.slice(cut + 1)]
}

export function Toast({ text, kind, onClose }) {
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (kind !== 'success') return undefined
    const timer = setTimeout(() => close.current?.(), 6000)
    return () => clearTimeout(timer)
  }, [text, kind])
  return (
    <div className={`hw-toast ${kind === 'success' ? 'is-ok' : 'is-bad'}`} role={kind === 'success' ? 'status' : 'alert'}>
      <span className="hw-toast-mark" aria-hidden="true" />
      <span className="hw-toast-text">{text}</span>
      {onClose ? (
        <button type="button" className="hw-icon-btn is-tiny" onClick={onClose} aria-label="关闭提示">
          <Icon name="x" size={12} />
        </button>
      ) : null}
    </div>
  )
}
