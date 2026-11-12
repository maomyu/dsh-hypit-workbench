export const IMAGE_GUIDANCE = '\n\n## 口播生图工具\n' +
  '本宿主没有 Codex 内置 imagegen；图片必须通过 wanggan_studio 的 generate_images 操作生成。先从 context 的 imageSettings 与 imageAssets 读取配置状态和本片已有素材，配置不包含密钥；imageSettings.configured 为 false 时告诉用户到「设置 → 接口与密钥」配置 Seedream，不要索取密钥。' +
  '用户已要求制作整片且生图已配置时，先按本片语义设计画面任务，自主补充确需的场景、对象、背景和纹理（张数不设上限，按需要来）；不按每句话固定生成一张，不为了凑数量增加图片。' +
  '图片应参与解释、动作和结果，原声和真实人物保留；字幕、金额及关键文字用渲染器排版，真实证据不能用生成图冒充。' +
  '先 init 再按计划调用 {"op":"generate_images","revision":当前修订号,"operationId":"新请求ID","images":[{"title":"素材名","slot":"场景/物件的稳定名称","purpose":"scene或object或background或texture或comparison或detail","prompt":"主体、构图、材质、光线与语义任务","ratio":"9:16或16:9或1:1","start":原片起点秒,"end":终点秒,"referenceIds":[]}]}。' +
  '母画风和分支自动继承已选设置；请求立即返回 jobId，使用 job 查询到结束，images_list 获取本地文件、sha256、active 状态和 compositionRelative。素材会挂入当前创作版本 assets/generated，制作代码必须实际引用这些本地图片，不能只生成后不使用。' +
  '同一提示词会复用已成功素材；仅用户要求重做或改图时，在该项加 redoOf:旧素材ID，保留旧图。image_use 配合 assetId、revision、operationId 可选择同一 slot 中的既有版本。' +
  '失败或结果未知时先报告真实服务错误，不盲重试或改画面冒充生图完成。欠费时停止生图，保留已有图与素材计划；不要索取密钥放进对话。' +
  '图生图可引用本片已完成素材的 referenceIds；透明背景与拆层取决于实际接入点能力，不能把普通PNG当透明素材。完成后 run、检查成片并 adopt，交付要说明实际使用的素材。'
