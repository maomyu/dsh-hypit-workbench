import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  classifyFile,
  discoverProjects,
  ensureRoot,
  validateCommandSource,
  expandHome,
  firstHeading,
  isInside,
  nodeStatus,
  normalizePath,
  parseProjectManifest,
  readProjectDetail,
  readSource,
  validateRoot,
} from '../src/store.js'

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'hypit-workbench-'))
  return { root, cleanup: () => rm(root, { recursive: true, force: true }) }
}

async function writeProject(dir, extra = {}) {
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, 'package.json'), JSON.stringify({
    name: extra.name ?? 'workshop-video',
    version: '0.0.0',
    private: true,
    hypit: { project: true },
  }))
  return dir
}

test('expandHome 展开 ~ 前缀', () => {
  assert.equal(expandHome('~/Hypit', '/Users/me'), '/Users/me/Hypit')
  assert.equal(expandHome('~', '/Users/me'), '/Users/me')
  assert.equal(expandHome('  /tmp/a  ', '/Users/me'), '/tmp/a')
  assert.equal(expandHome('', '/Users/me'), '')
})

test('isInside 只认目录边界', () => {
  assert.equal(isInside('/a/b/c', '/a/b'), true)
  assert.equal(isInside('/a/b', '/a/b'), true)
  assert.equal(isInside('/a/bc', '/a/b'), false)
  assert.equal(isInside('/a/b', '/a/b/c'), false)
  assert.equal(normalizePath('/a/b/'), '/a/b')
})

test('validateRoot 拒绝危险或不存在的根目录', async () => {
  const { root, cleanup } = await fixture()
  try {
    const home = '/Users/me'
    assert.equal((await validateRoot('/', { home })).ok, false)
    assert.equal((await validateRoot(home, { home })).ok, false)
    assert.equal((await validateRoot('~/.dsh/profiles', { home })).ok, false)
    assert.equal((await validateRoot('relative/path', { home })).ok, false)
    assert.equal((await validateRoot('', { home })).ok, false)
    assert.equal((await validateRoot(join(root, 'missing'), { home })).ok, false)

    await writeFile(join(root, 'file.txt'), 'x')
    assert.equal((await validateRoot(join(root, 'file.txt'), { home })).ok, false)

    const ok = await validateRoot(root, { home: '/Users/me' })
    assert.equal(ok.ok, true)
    assert.equal(ok.path, normalizePath(root))
  } finally {
    await cleanup()
  }
})

test('parseProjectManifest 只接受 hypit.project === true', () => {
  assert.deepEqual(
    parseProjectManifest(JSON.stringify({ name: 'a', version: '1.0.0', hypit: { project: true } })),
    { name: 'a', version: '1.0.0', title: '' },
  )
  assert.equal(parseProjectManifest(JSON.stringify({ name: 'a', hypit: { project: false } })), null)
  assert.equal(parseProjectManifest(JSON.stringify({ name: 'a' })), null)
  assert.equal(parseProjectManifest('not json'), null)
  assert.equal(parseProjectManifest('[]'), null)
})

test('firstHeading 取第一个标题或首行', () => {
  assert.equal(firstHeading('# 目标\n\n正文'), '目标')
  assert.equal(firstHeading('\n\n没有标题的正文'), '没有标题的正文')
  assert.equal(firstHeading(''), '')
})

test('classifyFile 按扩展名分类', () => {
  assert.equal(classifyFile('authors/main.svml'), 'source')
  assert.equal(classifyFile('a/b.svs'), 'source')
  assert.equal(classifyFile('build.svrun'), 'run')
  assert.equal(classifyFile('Brief.md'), 'doc')
  assert.equal(classifyFile('results/final.mp4'), 'result')
  assert.equal(classifyFile('package.json'), 'other')
})

test('nodeStatus 按 22.15 判定', () => {
  assert.equal(nodeStatus('22.15.0').ok, true)
  assert.equal(nodeStatus('23.10.0').ok, true)
  assert.equal(nodeStatus('22.14.9').ok, false)
  assert.equal(nodeStatus('20.11.1').ok, false)
})

test('discoverProjects 只收 hypit 项目，并跳过 node_modules', async () => {
  const { root, cleanup } = await fixture()
  try {
    await writeProject(join(root, 'ranking'), { name: 'ranking-video' })
    await writeFile(join(root, 'ranking', 'main.svml'), '<film />')
    await writeFile(join(root, 'ranking', 'Brief.md'), '# GOAT DEBATE\n\n20 秒足球梯队视频。')

    const podcast = join(root, 'podcast')
    await mkdir(podcast, { recursive: true })
    await writeFile(join(podcast, 'package.json'), JSON.stringify({ name: 'pod', hypit: { project: false } }))
    await mkdir(join(root, 'podcast', 'nested', 'project'), { recursive: true })
    await writeProject(join(root, 'podcast', 'nested', 'project'), { name: 'nested' })

    await mkdir(join(root, 'ranking', 'node_modules', 'fake'), { recursive: true })
    await writeFile(join(root, 'ranking', 'node_modules', 'fake', 'package.json'), JSON.stringify({ hypit: { project: true } }))

    const found = await discoverProjects(root)
    const names = found.projects.map(item => item.name).sort()
    assert.deepEqual(names, ['nested', 'ranking-video'])
    assert.equal(found.projects.some(item => item.root.includes('node_modules')), false)
    const ranking = found.projects.find(item => item.name === 'ranking-video')
    assert.equal(ranking.counts.source, 1)
    assert.equal(ranking.counts.doc, 1)
  } finally {
    await cleanup()
  }
})

test('discoverProjects 受深度限制约束', async () => {
  const { root, cleanup } = await fixture()
  try {
    await writeProject(join(root, 'a', 'b', 'c', 'deep-project'))
    const found = await discoverProjects(root, { depth: 4 })
    assert.equal(found.projects.length, 1)

    const shallow = await discoverProjects(root, { depth: 1 })
    assert.equal(shallow.projects.length, 0)
  } finally {
    await cleanup()
  }
})

test('readProjectDetail 汇总 Source、Run 和笔记', async () => {
  const { root, cleanup } = await fixture()
  try {
    const dir = await writeProject(join(root, 'clip'))
    await mkdir(join(dir, 'authors'), { recursive: true })
    await writeFile(join(dir, 'authors', 'main.svml'), '<film><script>你好</script></film>')
    await writeFile(join(dir, 'build.svrun'), '{"run":1}')
    await writeFile(join(dir, 'Brief.md'), '# 目标\n\n做一条 20 秒竖屏。')
    await writeFile(join(dir, 'Treatment.md'), '# 方案\n\n用对比结构。')

    const detail = await readProjectDetail(dir)
    assert.equal(detail.name, 'workshop-video')
    assert.equal(detail.counts.source, 1)
    assert.equal(detail.counts.run, 1)
    assert.equal(detail.counts.doc, 2)
    assert.equal(detail.sources[0].rel, join('authors', 'main.svml'))
    assert.deepEqual(detail.docs.map(doc => doc.title).sort(), ['方案', '目标'])
    assert.match(detail.docs.find(doc => doc.rel === 'Brief.md').excerpt, /20 秒竖屏/u)
  } finally {
    await cleanup()
  }
})

test('readSource 读取源码并拒绝越权路径', async () => {
  const { root, cleanup } = await fixture()
  try {
    const dir = await writeProject(join(root, 'clip'))
    await writeFile(join(dir, 'main.svml'), '<film>\n  <script>你好</script>\n</film>')
    await writeFile(join(root, 'outside.svml'), '<film />')

    const read = await readSource(dir, 'main.svml')
    assert.equal(read.lineCount, 3)
    assert.equal(read.lines[0], '<film>')

    await assert.rejects(() => readSource(dir, '../outside.svml'), error => error.code === 'invalid-source')
    await assert.rejects(() => readSource(dir, 'package.json'), error => error.code === 'invalid-source')
    await assert.rejects(() => readSource(dir, 'missing.svml'), error => error.code === 'source-not-found')
  } finally {
    await cleanup()
  }
})

test('ensureRoot 在主目录内自动创建缺失的默认目录', async () => {
  const { root, cleanup } = await fixture()
  const home = join(root, 'home')
  await mkdir(home, { recursive: true })
  try {
    const target = join(home, 'Hypit')
    assert.equal(existsSync(target), false)

    const first = await ensureRoot('~/Hypit', { home })
    assert.equal(first.ok, true)
    assert.equal(first.created, true)
    assert.equal(first.path, target)
    assert.equal(existsSync(target), true)

    const second = await ensureRoot('~/Hypit', { home })
    assert.equal(second.ok, true)
    assert.equal(second.created, false)
  } finally {
    await cleanup()
  }
})

test('ensureRoot 拒绝越界与受保护路径，且不创建目录', async () => {
  const { root, cleanup } = await fixture()
  const home = join(root, 'home')
  await mkdir(home, { recursive: true })
  try {
    const outside = join(root, 'outside', 'videos')
    const outsideResult = await ensureRoot(outside, { home })
    assert.equal(outsideResult.ok, false)
    assert.equal(outsideResult.created, false)
    assert.ok(outsideResult.error)
    assert.equal(existsSync(outside), false)

    const dshResult = await ensureRoot('~/.dsh/cache/hypit', { home })
    assert.equal(dshResult.ok, false)
    assert.equal(existsSync(join(home, '.dsh')), false)

    const homeResult = await ensureRoot('~', { home })
    assert.equal(homeResult.ok, false)

    const rootResult = await ensureRoot('/', { home })
    assert.equal(rootResult.ok, false)
  } finally {
    await cleanup()
  }
})

test('validateCommandSource 按命令限制扩展名并拒绝越界路径', () => {
  assert.equal(validateCommandSource('examples/main.svml', 'check'), 'examples/main.svml')
  assert.equal(validateCommandSource('look.svs', 'check'), 'look.svs')
  assert.equal(validateCommandSource('build.svrun', 'plan'), 'build.svrun')

  assert.throws(() => validateCommandSource('build.svrun', 'check'), error => error.code === 'invalid-source')
  assert.throws(() => validateCommandSource('main.svml', 'plan'), error => error.code === 'invalid-source')
  assert.throws(() => validateCommandSource('../outside.svml', 'check'), error => error.code === 'invalid-source')
  assert.throws(() => validateCommandSource('/etc/passwd.svml', 'check'), error => error.code === 'invalid-source')
  assert.throws(() => validateCommandSource('', 'check'), error => error.code === 'invalid-source')
})

test('createProject 建好带标记的项目，不覆盖已有目录', async () => {
  const { createProject, slugifyProjectName, discoverProjects: discover } = await import('../src/store.js')
  const home = await mkdtemp(join(tmpdir(), 'hw-create-'))
  const root = join(home, 'Hypit')
  await mkdir(root)
  try {
    const made = await createProject(root, '新品 预告  v1', '15 秒竖屏', { home })
    assert.equal(made.name, '新品-预告-v1')
    const found = await discover(root)
    assert.equal(found.projects.length, 1)
    assert.equal(found.projects[0].title, '新品-预告-v1')
    assert.ok(existsSync(join(made.root, 'notes', 'brief.md')))
    await assert.rejects(createProject(root, '新品 预告  v1', '', { home }), /已经存在/)
    const escaped = await createProject(root, '../escape', '', { home })
    assert.equal(escaped.root, join(root, 'escape'))
    assert.equal(existsSync(join(home, 'escape')), false)
    assert.equal(slugifyProjectName('../../etc'), 'etc')
    assert.equal(slugifyProjectName('   '), '')
    await assert.rejects(createProject(root, '///', '', { home }), /项目名/)
    await assert.rejects(createProject(home, 'x', '', { home }), /主目录/)
  } finally {
    await rm(home, { recursive: true, force: true })
  }
})
