import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { buildVideoPath, listBuilds } from '../src/hypit-films.js'

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'hypit-films-'))
  const dir = path.join(root, '.hypit/results/2026-11-12/bld_20261112T060346618Z_006D923327')
  await mkdir(path.join(dir, 'values'), { recursive: true })
  await mkdir(path.join(dir, 'files'), { recursive: true })
  await writeFile(path.join(dir, 'files/file-0001.mp4'), 'MP4')
  const value = (name, v) => writeFile(path.join(dir, 'values', name), JSON.stringify({ format: 'hypit.result-value@1', value: v }))
  await value('t.json', { id: 'program', frameCount: 450, frameRate: { numerator: 30, denominator: 1 } })
  await value('a.json', { id: 'program.quote', span: { startFrame: 120, endFrameExclusive: 330 } })
  await value('b.json', { id: 'program.hook', span: { startFrame: 0, endFrameExclusive: 120 } })
  await writeFile(path.join(dir, 'result.json'), JSON.stringify({
    format: 'hypit.build-result@1', source: { id: 'podcast-clip.svml' }, run: { id: 'clip.svrun' }, targets: ['clip.video'], outcome: 'complete', finishedAt: 1794463459949,
    outputs: {
      'program.timeline': { type: { name: 'Timeline' }, value: { kind: 'value', path: 'values/t.json' } },
      'program.quote': { type: { name: 'TemporalWindow' }, value: { kind: 'value', path: 'values/a.json' } },
      'program.hook': { type: { name: 'TemporalWindow' }, value: { kind: 'value', path: 'values/b.json' } },
      'clip.video': { type: { name: 'Blob' }, value: { kind: 'build-file', path: 'files/file-0001.mp4', size: 3, mediaType: 'video/mp4' } },
      'evil.video': { type: { name: 'Blob' }, value: { kind: 'build-file', path: '../../../../../etc/passwd', size: 1, mediaType: 'video/mp4' } },
    },
  }))
  return { root, dir }
}

test('listBuilds reads Hypit build results with chapters from temporal windows', async () => {
  const { root } = await fixture()
  try {
    const [build] = await listBuilds(root)
    assert.equal(build.id, 'bld_20261112T060346618Z_006D923327')
    assert.equal(build.duration, 15)
    assert.equal(build.run, 'clip.svrun')
    assert.equal(build.videos.length, 1)
    assert.deepEqual(build.chapters.map(c => [c.title, c.start, c.end]), [['hook', 0, 4], ['quote', 4, 11]])
    const { file } = await buildVideoPath(root, build.id)
    assert.ok(file.endsWith('files/file-0001.mp4'))
    await assert.rejects(buildVideoPath(root, '../x'), /无效/)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('listBuilds ignores folders without a playable video', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'hypit-films-'))
  try {
    await mkdir(path.join(root, '.hypit/results/2026-11-12/bld_20261112T000000000Z_AAAAAAAAAA'), { recursive: true })
    assert.deepEqual(await listBuilds(root), [])
    assert.deepEqual(await listBuilds(path.join(root, 'missing')), [])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
