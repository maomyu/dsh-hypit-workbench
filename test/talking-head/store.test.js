import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, readFile, symlink } from 'node:fs/promises'
import { createHash, randomUUID } from 'node:crypto'
import os from 'node:os'
import path from 'node:path'
import { StudioStore, SKILL_ROOT, keepRanges } from '../../src/talking-head/store.js'
import { executable, run } from '../../src/talking-head/process.js'

const temp = await mkdtemp(path.join(os.tmpdir(), 'wanggan-test-'))
const source = path.join(temp, 'source.mp4')
await run(executable('ffmpeg'), ['-nostdin','-v','error','-f','lavfi','-i','color=c=blue:s=160x240:r=20:d=2',
  '-f','lavfi','-i','sine=frequency=440:duration=2','-c:v','libx264','-c:a','aac','-pix_fmt','yuv420p','-shortest',source])
const store = new StudioStore(path.join(temp,'storage'))
const transcript = [{start:0,end:.6,text:'第一句'},{start:.6,end:1.2,text:'第二句'},{start:1.2,end:2,text:'第三句'}]
let project

test('imports independent source, keeps original four expert hashes', async () => {
  project = (await store.import({source,owned:true,transcript}, new AbortController().signal)).project
  assert.equal(project.transcript.length,3)
  assert.notEqual(store.root(project.id),path.dirname(source))
  const manifest=JSON.parse(await readFile(path.join(SKILL_ROOT,'module-manifest.json')))
  for(const entry of manifest.modules){
    const content=await readFile(path.join(SKILL_ROOT,entry.frozenCopy,'SKILL.md'))
    assert.equal(createHash('sha256').update(content).digest('hex'),entry.sha256)
  }
})
test('concurrent edit has one winner and retry preserves its revision', async () => {
  const first={projectId:project.id,revision:0,operationId:randomUUID(),action:'cut',indices:[1]}
  const second={...first,operationId:randomUUID(),indices:[2]}
  const results=await Promise.allSettled([store.edit(first),store.edit(second)])
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1)
  assert.match(results.find(result=>result.status==='rejected').reason.message,/已更新/)
  project=(await store.edit(first)).project
  assert.equal(project.revision,1)
  assert.deepEqual(keepRanges(project),[[0,.6],[1.2,2]])
})
test('renders edited MP4 with original audio and reloads durable version', async () => {
  const request={op:'render',projectId:project.id,revision:project.revision,operationId:randomUUID()}
  const first=await store.start(request,(project,signal,log)=>store.render(project,signal,log))
  const retry=await store.start(request,()=>{throw new Error('must not run twice')})
  assert.equal(first.job.id,retry.job.id)
  await store.jobs.get(first.job.id).promise
  const completed=(await store.job({projectId:project.id,jobId:first.job.id})).job
  assert.equal(completed.status,'succeeded',completed.error)
  const fresh=new StudioStore(store.directory)
  project=await fresh.get(project.id)
  assert.equal(project.versions.length,1)
  const info=await fresh.probe(path.join(store.root(project.id),'outputs',project.versions[0].id+'.mp4'))
  assert.ok(Math.abs(info.duration-1.4)<.1)
  assert.equal(info.hasAudio,true)
  const chunk=await fresh.media({projectId:project.id,version:project.versions[0].id,offset:0})
  assert.ok(chunk.next>0)
})
test('rejects traversal, symlinks and stale source selections', async () => {
  await assert.rejects(store.projectPath(project.id,'../../source.mp4'),/路径超出/)
  await symlink(temp,path.join(store.root(project.id),'creative'))
  await assert.rejects(store.projectPath(project.id,'creative/source.mp4'),/工程外/)
  await assert.rejects(store.media({projectId:project.id,version:randomUUID()}),/版本不存在/)
  await assert.rejects(store.edit({projectId:project.id,revision:project.revision,operationId:randomUUID(),action:'cut',indices:[999]}),/重新选择/)
})
test('generates a host-compatible WebM without changing the exported MP4', async () => {
  const version=project.versions[0].id
  const file=path.join(store.root(project.id),'outputs',version+'.mp4')
  const before=createHash('sha256').update(await readFile(file)).digest('hex')
  const part=await store.media({projectId:project.id,version,offset:0,compat:true})
  assert.equal(part.mime,'video/webm')
  assert.ok(part.next>0)
  assert.equal(createHash('sha256').update(await readFile(file)).digest('hex'),before)
})
test('cancellation stops a child process and retains the completed version', async () => {
  const request={op:'test',projectId:project.id,revision:project.revision,operationId:randomUUID()}
  const {job}=await store.start(request,(_,signal)=>run(process.execPath,['-e','setInterval(()=>{},1000)'],{signal}))
  await new Promise(resolve=>setTimeout(resolve,30))
  store.jobs.get(job.id).controller.abort()
  await store.jobs.get(job.id).promise
  assert.equal((await store.job({projectId:project.id,jobId:job.id})).job.status,'cancelled')
  assert.equal((await store.get(project.id)).versions.length,1)
})
test.after(async()=>{await store.dispose();await rm(temp,{recursive:true,force:true})})
