export const readOnlyCommands = new Set(['catalog','recipes','recipe','families','branches','components','standards','combinations','orchestrations','styles','choreographies','legacy-map','doctor','route','plan-change','audit-library','resolve','inspect'])
export const projectCommands = new Set(['init','compile','check','scope','run','select-orchestration','revise','patch-palette'])
const names = new Set(['recipe','orchestration','combination','request','reason','until','style','id','all','axes','module','plan','values','file','mode','branch','components','composition','kind','layout','motion','editing','sound'])
const files = new Set(['plan','values','file'])
export async function optionsArgs(options = {}, resolveFile) {
  const result = []
  for (const [name, value] of Object.entries(options)) {
    if (!names.has(name) || !['string','boolean'].includes(typeof value)) throw new Error('无效制作参数 ' + name)
    let actual = value
    if (files.has(name)) {
      if (!resolveFile || typeof value !== 'string') throw new Error('此文件参数需要当前工程')
      actual = await resolveFile(value)
    }
    result.push('--' + name)
    if (actual !== true) result.push(String(actual))
  }
  return result
}
