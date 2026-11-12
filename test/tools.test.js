import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { checkProject, describeProjects, planProject, resolveProject } from '../src/tool-logic.js'

async function makeProject(name) {
  // discoverProjects scans the children of a root, so keep one level between them.
  const parent = await mkdtemp(join(tmpdir(), 'hypit-root-'))
  const root = join(parent, name)
  await mkdir(join(root, 'examples'), { recursive: true })
  await writeFile(join(root, 'package.json'), JSON.stringify({ name, hypit: { project: true } }))
  await writeFile(join(root, 'examples', 'a.svml'), '<svml>\n</svml>\n')
  return root
}

test('resolveProject accepts a Hypit project directory', async () => {
  const root = await makeProject('demo')
  assert.equal(await resolveProject(root, undefined), root)
  await rm(root, { recursive: true, force: true })
})

test('resolveProject refuses a directory without the project marker', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hypit-plain-'))
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'plain' }))
  await assert.rejects(() => resolveProject(root, undefined), /不是 Hypit 项目/u)
  await rm(root, { recursive: true, force: true })
})

test('describeProjects lists projects and environment', async () => {
  const root = await makeProject('listed')
  const text = await describeProjects([dirname(root)])
  assert.match(text, /环境：/u)
  assert.match(text, /listed/u)
  assert.match(text, /1 源/u)
  await rm(root, { recursive: true, force: true })
})

test('checkProject reports a project without sources instead of throwing', async () => {
  const root = await mkdtemp(join(tmpdir(), 'hypit-empty-'))
  await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'empty', hypit: { project: true } }))
  const text = await checkProject({ project: root }, undefined)
  assert.match(text, /无法完成/u)
  assert.match(text, /没有 \.svml/u)
  await rm(root, { recursive: true, force: true })
})

test('planProject reports a project without runs instead of throwing', async () => {
  const root = await makeProject('runs')
  const text = await planProject({ project: root }, undefined)
  assert.match(text, /无法完成/u)
  assert.match(text, /没有 \.svrun/u)
  await rm(root, { recursive: true, force: true })
})
