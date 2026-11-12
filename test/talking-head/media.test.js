import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { loadMediaParts } from '../../src/talking-head/media.js'

test('out-of-order media responses reconstruct exact source bytes with bounded concurrency', async () => {
  const source = randomBytes(113), step = 10
  let active = 0, peak = 0
  const progress = []
  const loaded = await loadMediaParts(async offset => {
    peak = Math.max(peak, ++active)
    await new Promise(resolve => setTimeout(resolve, offset % 30 === 0 ? 8 : 1))
    active--
    return { size: source.length, next: Math.min(source.length, offset + step), data: source.subarray(offset,offset+step).toString('base64'), mime:'video/mp4' }
  }, undefined, value => progress.push(value))
  assert.deepEqual(Buffer.concat(loaded.parts), source)
  assert.equal(loaded.mime, 'video/mp4')
  assert.ok(peak > 1 && peak <= 4)
  assert.equal(progress.at(-1),100)
  assert.deepEqual(progress, [...progress].sort((a,b) => a-b))
})

test('refuses a changed file and respects cancelled media loads', async () => {
  let count = 0
  await assert.rejects(loadMediaParts(async () => (++count === 1 ? {size:20,next:10,data:Buffer.alloc(10).toString('base64')} : {size:21,next:20,data:Buffer.alloc(10).toString('base64')})),/发生变化/)
  const controller = new AbortController(); controller.abort()
  await assert.rejects(loadMediaParts(async () => ({size:10,next:10,data:Buffer.alloc(10).toString('base64')}),controller.signal), {name:'AbortError'})
})
