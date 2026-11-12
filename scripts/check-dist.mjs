import { readFile, access } from 'node:fs/promises'
import { constants } from 'node:fs'

const file = 'dist/client.js'
await access(file, constants.R_OK)
const text = await readFile(file, 'utf8')
const problems = []

if (!text.startsWith('window.__ModuleLoader__.load({id:\'dsh-hypit-workbench\'')) {
  problems.push('dist/client.js 没有以宿主模块加载器包裹开头')
}
if (!text.includes('return module.exports;}});')) {
  problems.push('dist/client.js 缺少加载器收尾')
}
for (const bare of ['from"react"', 'from "react"', 'from"react-dom"', 'from "react-dom"']) {
  if (text.includes(bare)) problems.push(`dist/client.js 里出现了 ESM 形式的宿主共享模块：${bare}`)
}
if (!text.includes('require("react")')) {
  problems.push('dist/client.js 没有通过宿主 require("react") 取共享 React')
}
if (!text.includes('sidebar.panellist')) problems.push('dist/client.js 里没有注册左侧栏入口')
if (!text.includes('hypitWorkbench') && !text.includes('dsh-hypit-workbench')) {
  problems.push('dist/client.js 里没有找到插件服务引用')
}

if (problems.length) {
  console.error(problems.map(item => `- ${item}`).join('\n'))
  process.exit(1)
}
console.log(`dist/client.js ok (${Buffer.byteLength(text)} bytes)`)
