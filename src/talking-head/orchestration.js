/** Orchestration names the production kit accepts (registry/orchestrations.json). */
import orchestrationRegistry from '../../vendor/wanggan/registry/orchestrations.json' with { type: 'json' }

/** Every name the production kit accepts for an orchestration, mapped to its id. */
const ORCHESTRATION_IDS = new Map()
for (const row of orchestrationRegistry) {
  for (const key of [row.id, row.code, row.name, ...(row.aliases ?? [])]) if (key) ORCHESTRATION_IDS.set(String(key).toLowerCase(), row.id)
}
/** Common guesses models make, keyed by the English idea of each mechanism. */
const ORCHESTRATION_GUESSES = {
  'same-object': 'relay', 'object-relay': 'relay', 'handoff': 'relay',
  'space': 'spatial', 'roaming': 'spatial', 'walkthrough': 'spatial',
  'build': 'assembly', 'disassembly': 'assembly', 'breakdown': 'assembly',
  'compare': 'parallel', 'comparison': 'parallel', 'contrast': 'parallel', 'side-by-side': 'parallel',
  'layers': 'reveal', 'layered-reveal': 'reveal', 'progressive': 'reveal',
  'cause-effect': 'consequence', 'action': 'consequence', 'result': 'consequence',
  'track': 'tracking', 'focus': 'tracking', 'lock': 'tracking',
  'reaction': 'response', 'presenter-response': 'response',
  'person': 'presenter', 'talking-head': 'presenter', 'host': 'presenter',
  'explainer': 'diagram', 'infographic': 'diagram',
}

/**
 * Map the orchestration a model passed to a real registry id. Unknown values
 * fail fast with the full list, so the agent can retry in one step instead of
 * starting a job that dies with "未知编排".
 */
export function normalizeOrchestration(value) {
  if (value === undefined || value === null || value === '' || value === 'auto') return value
  const key = String(value).trim().toLowerCase()
  const hit = ORCHESTRATION_IDS.get(key) ?? ORCHESTRATION_GUESSES[key]
  if (hit) return hit
  const list = orchestrationRegistry.map(row => `${row.id}（${row.name}）`).join('、')
  throw new Error(`没有「${value}」这个编排。可用的 orchestration：auto、${list}。`)
}


export function orchestrationIds() {
  return orchestrationRegistry.map(row => row.id)
}
