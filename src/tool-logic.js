import { isAbsolute } from 'node:path'
import { LIMITS, detectExecutor,
  detectSkill,
  discoverProjects,
  ensureRoot,
  isHypitProject,
  nodeStatus,
  readProjectDetail,
  runHypit,
  validateCommandSource,
} from './store.js'

const MAX_TEXT = 6000

function clip(text) {
  const value = String(text ?? '').trim()
  return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT)}\n…（输出过长，已截断）` : value
}

function failure(message) {
  return `无法完成：${message}`
}

function seconds(ms) {
  return `${Math.round((ms ?? 0) / 100) / 10}s`
}

/** The project a tool acts on: an explicit path, else the session's own directory. */
async function resolveProject(arg, exec) {
  const explicit = typeof arg === 'string' && arg.trim() ? arg.trim() : ''
  const candidate = explicit || exec?.agent?.session?.cwd || exec?.agent?.cwd || process.cwd()
  const path = String(candidate).replace(/\/+$/u, '')
  if (!isAbsolute(path)) throw Object.assign(new Error('project 需要绝对路径。'), { code: 'unknown-project' })
  if (!(await isHypitProject(path))) {
    throw Object.assign(
      new Error(`${path} 不是 Hypit 项目。project 要指向 package.json 里写着 "hypit": { "project": true } 的目录。`),
      { code: 'unknown-project' },
    )
  }
  return path
}

async function executorFor(root) {
  const executor = await detectExecutor([root])
  if (executor.found && executor.path && !executor.error) return executor
  return null
}

const installHint = '没找到 hypit 执行器。装：npm install --global @hypit/hypit --registry=https://registry.npmjs.org'

async function pickSource(root, rel) {
  if (rel) return validateCommandSource(rel, 'check')
  const detail = await readProjectDetail(root)
  const first = (detail.sources ?? [])[0]
  if (!first) throw Object.assign(new Error('这个项目里没有 .svml/.svs 源文件。'), { code: 'no-source' })
  return first.rel
}

async function pickRun(root, rel) {
  if (rel) return validateCommandSource(rel, 'plan')
  const detail = await readProjectDetail(root)
  const runs = detail.runs ?? []
  if (!runs.length) throw Object.assign(new Error('这个项目里没有 .svrun 运行文件。'), { code: 'no-run' })
  const newest = runs.slice().sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))[0]
  return newest.rel
}

async function formatOverview(roots) {
  const lines = []
  let executor = null
  const projectRoots = []
  for (const input of roots.slice(0, LIMITS.roots)) {
    const checked = await ensureRoot(input)
    if (!checked.ok) {
      lines.push(`根目录 ${checked.path || input}：不可用（${checked.error}）`)
      continue
    }
    const found = await discoverProjects(checked.path)
    lines.push(`根目录 ${checked.path}${checked.created ? '（已创建）' : ''}：${found.projects.length} 个项目`)
    for (const project of found.projects) {
      projectRoots.push(project.root)
      lines.push(
        `- ${project.title}｜${project.root}｜${project.counts?.source ?? 0} 源 / ${project.counts?.run ?? 0} Run / ${project.counts?.result ?? 0} 结果`,
      )
    }
    for (const problem of found.problems) lines.push(`  · ${problem.root}：${problem.message}`)
  }
  executor = await detectExecutor(projectRoots)
  const skill = await detectSkill()
  const node = nodeStatus()
  const state = [
    `执行器 ${executor.found ? executor.version || '已找到' : '未安装'}`,
    `技能 ${skill.found ? '已安装' : '未找到'}`,
    `Node ${node.ok ? `v${node.version}` : `${node.version || '?'}（需要 22.15+）`}`,
  ].join(' · ')
  return [`环境：${state}`, ...lines].join('\n')
}


/** Agent-facing project check: returns user-visible text, never throws. */
export async function checkProject(args, exec) {
  try {
    const root = await resolveProject(args?.project, exec)
    const rel = await pickSource(root, args?.source)
    const executor = await executorFor(root)
    if (!executor) return failure(installHint)
    const result = await runHypit(executor.path, ['check', rel], { cwd: root })
    const body = clip([result.stdout, result.stderr].filter(Boolean).join('\n'))
    return [
      `$ hypit check ${rel}   （项目 ${root}）`,
      `退出码 ${result.code} · ${seconds(result.durationMs)}${result.timedOut ? ' · 超时' : ''}`,
      '',
      body || '（没有输出）',
      '',
      result.code === 0 ? '结论：Source 通过。' : '结论：没通过，按上面的报错改 Source 或项目依赖，再跑一次。',
    ].join('\n')
  } catch (error) {
    return failure(error?.message ?? error)
  }
}

/** Agent-facing plan: returns user-visible text, never throws. */
export async function planProject(args, exec) {
  try {
    const root = await resolveProject(args?.project, exec)
    const rel = await pickRun(root, args?.run)
    const executor = await executorFor(root)
    if (!executor) return failure(installHint)
    const result = await runHypit(executor.path, ['plan', rel], { cwd: root })
    const body = clip([result.stdout, result.stderr].filter(Boolean).join('\n'))
    return [
      `$ hypit plan ${rel}   （项目 ${root}）`,
      `退出码 ${result.code} · ${seconds(result.durationMs)}${result.timedOut ? ' · 超时' : ''}`,
      '',
      body || '（没有输出）',
      '',
      result.code === 0
        ? '结论：计划有效。把请求数量和花费讲给用户，确认后再 build。'
        : '结论：计划没通过，先修 Source 或 Run。',
    ].join('\n')
  } catch (error) {
    return failure(error?.message ?? error)
  }
}

export { resolveProject, formatOverview as describeProjects }
