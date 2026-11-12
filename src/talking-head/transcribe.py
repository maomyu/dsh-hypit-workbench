import sys,json,os,re,argparse
os.environ['HF_HUB_OFFLINE']='1'
os.environ['HF_HUB_DISABLE_TELEMETRY']='1'
from faster_whisper import WhisperModel
p=argparse.ArgumentParser()
p.add_argument('source',nargs='?')
p.add_argument('--model-dir')
p.add_argument('--self-test',action='store_true')
a=p.parse_args()
model=None
names=[a.model_dir] if a.model_dir else [os.environ.get('WANGGAN_ASR_MODEL','small'),'base']
for name in names:
 try:
  model=WhisperModel(name,device='cpu',compute_type='int8',cpu_threads=4,local_files_only=True)
  break
 except Exception:
  pass
if model is None: raise RuntimeError('内置识别模型加载失败；开发版请准备本地small或base模型')
if a.self_test:
 print(json.dumps({'ok':True,'engine':'faster-whisper','offline':True,'python':sys.version.split()[0],'model':'small' if a.model_dir else name}),flush=True)
 sys.exit(0)
if not a.source:p.error('需要输入视频或音频文件')
def progress(n,stage):print(json.dumps({'type':'progress','percent':n,'stage':stage},ensure_ascii=False),flush=True)
progress(8,'本地模型已加载，正在检测人声')
segments,info=model.transcribe(a.source,language='zh',vad_filter=True,beam_size=3,word_timestamps=True)
result=[]
for s in segments:
 words=s.words or []
 if not words:
  if s.text.strip():result.append({'start':s.start,'end':s.end,'text':s.text.strip()})
 else:
  text='';start=words[0].start;group=[]
  for i,w in enumerate(words):
   text+=w.word
   group.append({'start':round(w.start,3),'end':round(w.end,3),'text':w.word})
   if len(text.strip())>=20 or (len(text.strip())>=7 and re.search(r'[，。！？；,.!?;]$',text)) or i==len(words)-1:
    if w.end-start>.05:result.append({'start':round(start,3),'end':round(w.end,3),'text':text.strip(),'words':group})
    text='';group=[]
    if i+1<len(words):start=words[i+1].start
 progress(min(98,10+round(s.end/max(info.duration,.1)*88)),'正在识别人声 '+str(round(s.end))+'/'+str(round(info.duration))+'秒')
print(json.dumps(result,ensure_ascii=False),flush=True)
