# 来源与许可

网感口播技能、配方、字体、渲染脚本和样例来自 Maoyu 的 Wanggan Talking Head 1.23.8，原项目 https://github.com/maomyu/wanggan-talking-head ，原提交 e8fb5ac69834cfebc329b0205cfa57ad1cc1e492。原版内容保存在 vendor/wanggan，原 MIT 版权声明与第三方许可随目录保留。四份专家技能正文按原清单校验 SHA-256。

Harness 适配仅调整原 scripts/studio.mjs 的 HyperFrames 依赖定位，使预构建 npm 包从自身依赖解析渲染器。历史参考渲染器另按样片实际 CSS 声明记录字体用途，避免将未使用的书写字体用于检查整页文字。本插件注册自己的 Host 服务、Agent 工具、技能 provider 与 Client 插槽。HyperFrames 0.8.174 及其第三方依赖由 npm 锁文件固定并保留包内许可证。

字幕识别脚本来自本机 Maoyu 网感口播工作台，使用本地 faster-whisper 模型。字体的独立许可见 vendor/wanggan/assets/fonts。原项目的证据和复现样例遵循其现有用途，生产素材由用户明确选择。
