import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeOrchestration } from '../../src/talking-head/orchestration.js'

test('normalizeOrchestration maps ids, codes, names and common guesses', () => {
  assert.equal(normalizeOrchestration('relay'), 'relay')
  assert.equal(normalizeOrchestration('G02'), 'relay')
  assert.equal(normalizeOrchestration('同物接力'), 'relay')
  assert.equal(normalizeOrchestration('same-object'), 'relay')
  assert.equal(normalizeOrchestration('Comparison'), 'parallel')
  assert.equal(normalizeOrchestration('auto'), 'auto')
  assert.equal(normalizeOrchestration(undefined), undefined)
})

test('normalizeOrchestration rejects unknown names with the full list', () => {
  assert.throws(() => normalizeOrchestration('zoom-blast'), /没有「zoom-blast」.*relay（同物接力）/)
})
