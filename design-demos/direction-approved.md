# 方向确认 · A · 媒体架

## 用户选择

> 「A 浅色主题即可」

- 方向：**A · Dailies（媒体架）**
- 主题：**只做浅色**，深色不做第二套皮肤（但仍绑定宿主 token，宿主切深色时不至于崩）
- 时间：2026-11-11

## 展示过什么

| 版本 | 文件 | 截图 |
| --- | --- | --- |
| 浅色 | `a-dailies.html` | `shots/a-dailies-light.png` |
| 深色 | `a-dailies.html` | `shots/a-dailies-dark.png` |
| 对照板（A/B/C × 浅深） | `compare.html` | `shots/compare.png` |

三方向完整版：`a-dailies.html`、`b-script.html`、`c-instrument.html`。配色已先按「适配当前应用」绑定宿主 `--dsw-alias-*`。

## 落地范围

1. 插件面板按 A 重排：顶栏（品牌 + 环境）→ 左项目架 → 右 inspector（四统计 / check 与 plan 并排 / 源码分页 / 底部交接条）。
2. 颜色只引用宿主 token（`--hw-*` 映射层），不写死品牌粉；Hypit logo 用官方 SVG，浅底用 `-dark` 文件。
3. 保留已有能力：项目扫描、根目录编辑、自动创建、源码预览、check、plan、三种交接。
4. 浅色为验收主题；深色只保证 token 生效、文字可读。

## 2026-11-11 追加：交互改为对话驱动

> 「做成对话驱动的」

- 面板不再有「校验源码 / 看要跑什么」这类执行按钮；操作全部落到对话里，由 agent 执行。
- 插件注册三个 agent 工具：`hypit_projects`、`hypit_check`、`hypit_plan`；面板只提供项目上下文与一句话入口。
- 视觉沿用 A（媒体架、浅色、宿主 token），四个统计改为文件事实：Sources / Runs / Notes / Results。

## 不做的

- 不做深色专属样式与第二套强调色。
- 不在本轮做 build / 结果预览（缺 Runtime Profile 与模型账号）。
