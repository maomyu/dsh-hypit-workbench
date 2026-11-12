import test from 'node:test'
import assert from 'node:assert/strict'
import { optionsArgs, readOnlyCommands } from '../../src/talking-head/commands.js'
test('forwards content plan and module options through the scoped file resolver', async () => {
  const args=await optionsArgs({recipe:'minimal',plan:'creative/scene-plan.json',axes:'rhythm'},async path=>'/owned/'+path)
  assert.deepEqual(args,['--recipe','minimal','--plan','/owned/creative/scene-plan.json','--axes','rhythm'])
  assert.ok(readOnlyCommands.has('route'))
  await assert.rejects(optionsArgs({plan:'/other/scene.json'}),/需要当前工程/)
  await assert.rejects(optionsArgs({source:'/other/file.mp4'}),/无效制作参数/)
})
