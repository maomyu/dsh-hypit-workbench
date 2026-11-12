import families from '../../vendor/wanggan/registry/families.json' with { type: 'json' }
import production from '../../vendor/wanggan/registry/production-catalog.json' with { type: 'json' }
import branches from '../../vendor/wanggan/registry/branches.json' with { type: 'json' }
import components from '../../vendor/wanggan/registry/components.json' with { type: 'json' }
import orchestrations from '../../vendor/wanggan/registry/orchestrations.json' with { type: 'json' }

export const artStyles = families.map(family => {
  const recipe = production.families.find(row => row.familyId === family.id)
  return { id: family.id, name: recipe.name, familyName: family.name, definition: family.definition,
    identityRules: family.identityRules, preview: family.preview, recipe: recipe.id,
    recipeFile: recipe.recipe, referenceProject: recipe.referenceProject,
    visualMechanism: recipe.productionRules.layout, productionRules: recipe.productionRules }
})
export const artStyleBranches = branches.map(({ id, familyId, name, rules, boundary }) => {
  const implemented = production.implementedBranches.find(row => row.branchId === id)
  return { id, familyId, name, rules, boundary, ...(implemented ? { recipe: implemented.id, referenceProject: implemented.referenceProject } : {}) }
})
export const artStyleComponents = components.map(({ id, name, kind, contract, boundary }) => ({ id, name, kind, contract, boundary }))
export const artStyleOrchestrations = orchestrations.filter(row => row.kind === 'mechanism').map(({ id, code, name, principle, when }) => ({ id, code, name, principle, when }))
export function artStyle(id) {
  if (id === null) return null
  const style = artStyles.find(row => row.id === id)
  if (!style) throw new Error('请选择当前母画风库中的有效画风')
  return { ...style }
}
export function visualPreferences({ styleId, branchId = null, componentId = null, orchestrationId = null }) {
  const style = artStyle(styleId)
  const branch = branchId ? artStyleBranches.find(row => row.id === branchId && row.familyId === style?.id) : null
  if (branchId && !branch) throw new Error('分支必须属于选中的母画风')
  const component = componentId ? artStyleComponents.find(row => row.id === componentId) : null
  if (componentId && !component) throw new Error('请选择有效的组件参考')
  const orchestration = orchestrationId ? artStyleOrchestrations.find(row => row.id === orchestrationId) : null
  if (orchestrationId && !orchestration) throw new Error('请选择有效的编排机制')
  return { style, branch, component, orchestration }
}
export function fullVideoPrompt(preferences) {
  const { style, branch, component, orchestration } = preferences || {}
  return '按实际内容设计并制作完整视频，' + (style ? '母画风使用已选的「' + style.name + '」' : '按内容自主选择母画风') +
    (branch ? '，分支选「' + branch.name + '」' : '') + (component ? '，参照组件「' + component.name + '」并按文案适配' : '') +
    (orchestration ? '，编排使用「' + orchestration.name + '」' : '，按当前文案选择编排') + '，保留原声与原意。'
}
export function useSelectedStyle(input, project) {
  if (input.op !== 'studio' || input.command !== 'init' || !project.visualPreferences) return input
  const { style, branch, component, orchestration } = project.visualPreferences
  const options = { ...input.options }
  if (style) {
    const recipe = branch?.recipe || style.recipe
    if (options.style || options.combination || (options.recipe && ![recipe, style.id, style.recipe, style.name, style.familyName].includes(options.recipe))) {
      throw new Error('当前视频已选「' + style.name + '」母画风，请用 options.recipe=' + style.recipe + '，不使用旧 options.style；更换前先更新画风选择。')
    }
    options.recipe = recipe
  }
  if (branch) {
    if (options.branch && options.branch !== branch.id) throw new Error('请保留已选分支「' + branch.name + '」')
    options.branch = branch.id
  }
  if (component) options.components = [...new Set([...(options.components ? options.components.split(',') : []), component.id])].join(',')
  if (orchestration) {
    if (options.orchestration && !['auto', orchestration.id, orchestration.code, orchestration.name].includes(options.orchestration)) throw new Error('请保留已选编排「' + orchestration.name + '」')
    options.orchestration = orchestration.id
  } else if (!options.orchestration) options.orchestration = 'auto'
  return { ...input, options }
}
