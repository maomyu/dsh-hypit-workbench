import test from 'node:test'
import assert from 'node:assert/strict'
import { checkFindings, parseCheckLog } from '../../src/talking-head/check-summary.js'

const log = `[hyperframes] probe\n{"layout":{"ok":false,"findings":[{"code":"content_overlap","severity":"error","text":"盲目打理"},{"code":"text_occluded","severity":"info","text":"哗"}]},"contrast":{"ok":false,"findings":[{"code":"contrast_aa_failure","severity":"error","text":"画面为解释示意","ratio":4.44,"requiredRatio":4.5}]},"_meta":{}}\n[hyperframes] done`

test('check summary keeps only errors, in plain words', () => {
  const findings = checkFindings(parseCheckLog(log))
  assert.deepEqual(findings, ['文字互相重叠「盲目打理」', '文字对比度不够「画面为解释示意」（4.44:1，需要 4.5:1）'])
})

test('check summary tolerates garbage', () => {
  assert.equal(parseCheckLog('no json here'), null)
  assert.deepEqual(checkFindings(null), [])
})
