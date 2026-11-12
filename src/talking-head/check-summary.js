/**
 * Turn the production kit's quality-gate output into one readable line.
 *
 * `studio run` fails with "check失败，查看qa/check.log" and leaves a JSON
 * report there. The panel and the agent both need the actual reasons.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const LABELS = {
  content_overlap: '文字互相重叠',
  text_occluded: '文字被遮挡',
  text_overflow: '文字溢出',
  contrast_aa_failure: '文字对比度不够',
  off_pivot_rotation: '旋转中心不对',
}

/** Pick error-level findings from a hyperframes check report object. */
export function checkFindings(report) {
  const out = []
  for (const [area, value] of Object.entries(report ?? {})) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.findings)) continue
    for (const finding of value.findings) {
      if (finding?.severity !== 'error') continue
      const label = LABELS[finding.code] ?? finding.code ?? area
      const text = String(finding.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 24)
      const extra = finding.code === 'contrast_aa_failure' && finding.ratio ? `（${finding.ratio}:1，需要 ${finding.requiredRatio ?? 4.5}:1）` : ''
      out.push(`${label}${text ? `「${text}」` : ''}${extra}`)
    }
  }
  return [...new Set(out)]
}

/** Parse the JSON object embedded in qa/check.log (it has log lines around it). */
export function parseCheckLog(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start < 0 || end <= start) return null
  try { return JSON.parse(text.slice(start, end + 1)) } catch { return null }
}

/** Read <creative>/qa/check.log and return a short human summary, or ''. */
export async function summarizeCheck(creativeDir) {
  let text
  try { text = await readFile(path.join(creativeDir, 'qa/check.log'), 'utf8') } catch { return '' }
  const findings = checkFindings(parseCheckLog(text))
  if (!findings.length) return ''
  return `质量检查没通过：${findings.slice(0, 4).join('；')}${findings.length > 4 ? ` 等 ${findings.length} 处` : ''}。`
}
