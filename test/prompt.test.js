import test from 'node:test'
import assert from 'node:assert/strict'
import { buildPlan, kindTitle } from '../src/prompt.js'

test('kindTitle 覆盖三种任务并回退到制作', () => {
  assert.equal(kindTitle('clone'), '克隆参考视频')
  assert.equal(kindTitle('create'), '从描述制作视频')
  assert.equal(kindTitle('continue'), '继续推进项目')
  assert.equal(kindTitle('unknown'), '从描述制作视频')
})

test('clone 计划带上参考视频、项目目录和预算边界', () => {
  const plan = buildPlan({
    kind: 'clone',
    project: '/Users/me/Hypit/ranking',
    reference: '/Users/me/Movies/goat.mp4',
    brief: '换成科技创始人',
    label: 'GOAT DEBATE',
  })
  assert.equal(plan.kind, 'clone')
  assert.equal(plan.title, 'Hypit · 克隆 GOAT DEBATE')
  assert.match(plan.prompt, /参考视频：\/Users\/me\/Movies\/goat\.mp4/u)
  assert.match(plan.prompt, /项目目录：\/Users\/me\/Hypit\/ranking/u)
  assert.match(plan.prompt, /换成科技创始人/u)
  assert.match(plan.prompt, /费用/u)
  assert.match(plan.prompt, /等我确认/u)
})

test('clone 缺少参考视频时提示先索要素材', () => {
  const plan = buildPlan({ kind: 'clone' })
  assert.match(plan.prompt, /请先问我要文件或链接/u)
  assert.match(plan.prompt, /保留原片的节奏/u)
})

test('create 用描述生成，缺描述时要求澄清', () => {
  const plan = buildPlan({ kind: 'create', project: '/tmp/p', brief: '20 秒竖屏咖啡测评' })
  assert.equal(plan.title, 'Hypit · 制作视频')
  assert.match(plan.prompt, /想做的视频：20 秒竖屏咖啡测评/u)
  assert.match(plan.prompt, /hypit doctor/u)

  const empty = buildPlan({ kind: 'create' })
  assert.match(empty.prompt, /请先问我要主题/u)
})

test('continue 汇总项目现有素材', () => {
  const plan = buildPlan({
    kind: 'continue',
    project: '/tmp/p',
    label: '咖啡',
    brief: '换结尾',
    counts: { source: 2, run: 1, doc: 3, result: 4 },
  })
  assert.equal(plan.title, 'Hypit · 继续 咖啡')
  assert.match(plan.prompt, /2 个 Source（SVML）/u)
  assert.match(plan.prompt, /1 个 Run（SVRun）/u)
  assert.match(plan.prompt, /4 个结果文件/u)
  assert.match(plan.prompt, /这次要改的地方：换结尾/u)
})

test('continue 没有素材时说明清楚', () => {
  const plan = buildPlan({ kind: 'continue', counts: {} })
  assert.match(plan.prompt, /还没有可识别的素材/u)
  assert.match(plan.prompt, /先通读 Brief/u)
})

test('未知 kind 回退为 create，长文本被截断', () => {
  const plan = buildPlan({ kind: 'nope', brief: 'x'.repeat(3000) })
  assert.equal(plan.kind, 'create')
  assert.ok(plan.prompt.length < 2600)
  assert.match(plan.prompt, /…/u)
})

test('输入里的空值和非字符串不会破坏计划', () => {
  const plan = buildPlan({ kind: 'clone', project: null, reference: 42, brief: undefined, label: {} })
  assert.equal(typeof plan.prompt, 'string')
  assert.equal(plan.title, 'Hypit · 克隆参考视频')
})
