export const PACKAGE = 'dsh-hypit-workbench'
export const SERVICE = 'hypitWorkbench'

const codec = {
  mode: 'strict',
  typeSymbol: 'HypitWorkbenchJson',
  create: () => ({
    parse(value) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Expected an object')
      return value
    },
  }),
}

export const descriptors = [{
  id: SERVICE + '/request',
  service: SERVICE,
  namespace: SERVICE,
  method: 'request',
  invocation: { kind: 'direct' },
  parameters: [{ name: 'input', wire: 'input', source: 'json', codec }],
  cancellation: { parameter: 'signal' },
  result: codec,
}]

export const TYPERT = {
  package: PACKAGE,
  face: 'host',
  schemas: [],
  model: { services: [], events: [], objects: [] },
  invocations: descriptors,
}
