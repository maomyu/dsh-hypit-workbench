export const KINDS = ['clone', 'create', 'continue']

const KIND_TITLES = {
  clone: '克隆参考视频',
  create: '从描述制作视频',
  continue: '继续推进项目',
}

export function kindTitle(kind) {
  return KIND_TITLES[kind] ?? KIND_TITLES.create
}

function clean(value, limit = 400) {
  if (typeof value !== 'string') return ''
  const text = value.replace(/\r\n/gu, '\n').trim()
  if (text.length <= limit) return text
  return text.slice(0, limit - 1).trimEnd() + '…'
}

function describeCounts(counts) {
  if (!counts || typeof counts !== 'object') return '项目里还没有可识别的素材。'
  const parts = []
  if (counts.source) parts.push(`${counts.source} 个 Source（SVML）`)
  if (counts.run) parts.push(`${counts.run} 个 Run（SVRun）`)
  if (counts.result) parts.push(`${counts.result} 个结果文件`)
  if (counts.doc) parts.push(`${counts.doc} 份项目笔记`)
  return parts.length ? `现有 ${parts.join('、')}。` : '项目里还没有可识别的素材。'
}

export function buildPlan(input) {
  const kind = KINDS.includes(input?.kind) ? input.kind : 'create'
  const project = clean(input?.project, 600)
  const reference = clean(input?.reference, 600)
  const brief = clean(input?.brief, 2000)
  const label = clean(input?.label, 80)
  const counts = input?.counts

  const lines = []
  let title = ''

  if (kind === 'clone') {
    title = label ? `Hypit · 克隆 ${label}` : 'Hypit · 克隆参考视频'
    lines.push('用 Hypit 技能克隆一条参考视频。', '')
    lines.push(`参考视频：${reference || '（还没给，请先问我要文件或链接）'}`)
    if (project) lines.push(`项目目录：${project}`)
    lines.push('', `要保留和要替换的内容：${brief || '先保留原片的节奏、镜头结构和字幕逻辑，替换人物、产品和文案；具体替换内容我会补充。'}`)
  } else if (kind === 'continue') {
    title = label ? `Hypit · 继续 ${label}` : 'Hypit · 继续推进项目'
    lines.push('接着推进这个 Hypit 项目。', '')
    if (project) lines.push(`项目目录：${project}`)
    lines.push(`当前状态：${describeCounts(counts)}`)
    lines.push('', `这次要改的地方：${brief || '先通读 Brief、Treatment 和已有的 Source，把当前进度和下一步告诉我，再等我确认改哪里。'}`)
  } else {
    title = label ? `Hypit · 制作 ${label}` : 'Hypit · 制作视频'
    lines.push('用 Hypit 技能从零制作一条视频。', '')
    lines.push(`想做的视频：${brief || '（还没说清，请先问我要主题、平台和时长）'}`)
    if (project) lines.push(`项目目录：${project}`)
    if (reference) lines.push(`参考素材：${reference}`)
  }

  lines.push(
    '',
    '按 hypit 技能的流程做：先读技能说明和环境参考，把目标写进 Brief、把你的创意方案写进 Treatment，再进入素材准备和合成。',
    '执行器、技能和生成服务是否就绪，以 `hypit doctor` 的实际结果为准。缺哪一步就先告诉我需要准备什么，不要跳过检查假装跑通。',
    '任何会产生费用的生成、转录或渲染，先给出范围、用哪个服务和大致花费，等我确认后再提交。',
    '过程里把具体发现和你的选择讲清楚；项目目录里留下能让下一轮接着做的记录。',
  )

  return {
    kind,
    title,
    prompt: lines.join('\n'),
  }
}

/** Conversation-driven task: the agent runs the project, the panel only supplies context. */
export function buildTask(input) {
  const project = clean(input?.project, 600)
  const label = clean(input?.label, 80)
  const intent = clean(input?.intent, 2000)
  const counts = input?.counts
  const title = label ? `Hypit · ${label}` : 'Hypit · 视频项目'

  const lines = [
    '在 Hypit 视频项目里推进一件事。',
    '',
    project ? `项目目录：${project}` : '项目目录：先问我哪个项目',
    `当前状态：${describeCounts(counts)}`,
    '',
    `我要做的事：${intent || '先读项目现状，把进度、卡点和一个具体建议讲给我，再等我决定做什么。'}`,
    '',
    '你手上有 hypit_projects / hypit_check / hypit_plan 三个工具，直接用：',
    '- 不确定项目路径或环境是否就绪，先 hypit_projects；',
    '- 改了 Source 就 hypit_check，通过了再说下一步；',
    '- 要动 build 之前先 hypit_plan，把请求数量和大致花费讲清楚。',
    '',
    '按 hypit 技能的流程做：先读技能说明，把目标写进 Brief、创意方案写进 Treatment，再准备素材和合成。',
    '任何会产生费用的生成、转录或渲染，先给范围和花费，等我确认后再提交；没确认就不要跑。',
    '遇到缺依赖、缺 Runtime Profile、缺账号这类问题，直接说清楚缺什么、怎么补，不要跳过检查假装跑通。',
    '每一步做完告诉我结果和证据（命令、输出、文件路径），再问我要不要继续。',
  ]

  return { kind: 'task', title, prompt: lines.join('\n') }
}
