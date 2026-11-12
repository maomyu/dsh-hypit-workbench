import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { chaptersOf, filmDetail, matchCreative } from '../../src/talking-head/films.js'

test('chaptersOf maps scenes to seconds and latest headline', () => {
  const chapters = chaptersOf(
    { fps: 30, scenes: [{ startFrame: 0, endFrame: 150, purpose: '提问' }, { startFrame: 150, endFrame: 300, purpose: '展开' }] },
    { headlines: [[0, '越努力\n越存不到钱？'], [120, '钱去哪了']] },
  )
  assert.deepEqual(chapters.map(c => [c.start, c.end, c.title]), [[0, 5, '越努力 越存不到钱'], [5, 10, '钱去哪了']])
})

test('filmDetail finds the creative folder by content and reads its stills', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'films-'))
  try {
    const id = '11111111-1111-4111-8111-111111111111'
    await mkdir(path.join(root, 'outputs'), { recursive: true })
    await mkdir(path.join(root, 'creative-a/outputs'), { recursive: true })
    await mkdir(path.join(root, 'creative-b/outputs'), { recursive: true })
    await writeFile(path.join(root, 'outputs', id + '.mp4'), 'FILM-B')
    await writeFile(path.join(root, 'creative-a/outputs/final.mp4'), 'FILM-A')
    await writeFile(path.join(root, 'creative-b/outputs/final.mp4'), 'FILM-B')
    await writeFile(path.join(root, 'creative-b/outputs/poster.jpg'), 'jpg')
    await writeFile(path.join(root, 'creative-b/recipe.json'), JSON.stringify({ name: '复古网点 · 同源完整配方' }))
    await writeFile(path.join(root, 'creative-b/project.json'), JSON.stringify({ status: 'verified' }))
    assert.equal(await matchCreative(root, id), 'creative-b')
    const film = await filmDetail(root, { id, label: '创作版本 2', duration: 36.7 })
    assert.equal(film.kind, 'creative')
    assert.equal(film.style, '复古网点')
    assert.equal(film.hasPoster, true)
    assert.equal(film.hasContact, false)
    assert.equal(film.verified, true)
    const cut = await filmDetail(root, { id: '22222222-2222-4222-8222-222222222222', label: '剪辑版本 1', duration: 30 })
    assert.equal(cut.kind, 'cut')
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
