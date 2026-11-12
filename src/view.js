export function formatTime(value) {
  if (typeof value !== 'string' || !value) return '时间未知'
  const time = Date.parse(value)
  if (!Number.isFinite(time)) return '时间未知'
  const delta = Date.now() - time
  if (delta < 0) return '刚刚'
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (delta < minute) return '刚刚'
  if (delta < hour) return `${Math.floor(delta / minute)} 分钟前`
  if (delta < day) return `${Math.floor(delta / hour)} 小时前`
  if (delta < 7 * day) return `${Math.floor(delta / day)} 天前`
  const date = new Date(time)
  const pad = number => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function shortPath(value, max = 46) {
  const text = typeof value === 'string' ? value : ''
  if (!text) return ''
  const replaced = text.replace(/^\/Users\/[^/]+/u, '~')
  if (replaced.length <= max) return replaced
  return '…' + replaced.slice(replaced.length - max + 1)
}

export function countSummary(counts) {
  if (!counts || typeof counts !== 'object') return '还没有可识别的素材'
  const parts = []
  if (counts.source) parts.push(`${counts.source} 个 Source`)
  if (counts.run) parts.push(`${counts.run} 个 Run`)
  if (counts.doc) parts.push(`${counts.doc} 份笔记`)
  if (counts.result) parts.push(`${counts.result} 个结果`)
  return parts.length ? parts.join(' · ') : '还没有可识别的素材'
}

export function projectMeta(project) {
  const pieces = [countSummary(project?.counts)]
  if (project?.updatedAt) pieces.push(formatTime(project.updatedAt))
  return pieces.filter(Boolean).join(' · ')
}

export function executorLabel(executor) {
  if (!executor?.found) return '未找到 hypit'
  return executor.version || '已找到 hypit'
}

export function executorHint(executor) {
  if (executor?.found && !executor.error) return executor.path || ''
  if (executor?.found) return `${executor.path}（${executor.error}）`
  return '安装技能后按提示准备执行器：npx skills add hypit-ai/hypit -g'
}

export function sourceLabel(source) {
  return source?.rel || '未命名源文件'
}

export function formatBytes(bytes) {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value < 0) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(value < 10240 ? 1 : 0)} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function splitRoots(text) {
  return String(text ?? '')
    .split(/[\n,]+/u)
    .map(item => item.trim())
    .filter(Boolean)
}

export function kindHint(kind) {
  if (kind === 'clone') return '给一条参考视频，按它的结构做你自己的版本。'
  if (kind === 'continue') return '项目已经开工，接着改这一版。'
  return '从一句描述开始做一条新视频。'
}

export function messageFor(error) {
  if (!error) return '操作未完成，请稍后再试。'
  if (error.code === 'forbidden') return '当前账号不能查看本地视频项目。'
  if (error.code === 'unknown-project') return error.message || '这个项目不在最近一次扫描结果里，请先刷新。'
  if (error.code === 'invalid-source') return error.message || '这个源文件无法读取。'
  if (error.code === 'source-not-found') return '这个源文件已经不存在，请刷新项目。'
  if (error.code === 'source-too-large') return '源文件太大，请直接在编辑器里查看。'
  if (error.code === 'aborted') return '这次读取已取消。'
  if (error.code === 'executor-missing') return error.message || '没找到 hypit 执行器。'
  return error.message || '操作未完成，请稍后再试。'
}
