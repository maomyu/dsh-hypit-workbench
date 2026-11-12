# 安装 dsh-hypit-workbench

目标宿主：DeepSeek Harness `0.2.2-rc.2`（桌面端或 web profile 均可）。

## 一、离线包安装（推荐）

1. 打开 DeepSeek Harness，进入左侧栏 **插件** 页。
2. 选 **添加插件**，选中 `dsh-hypit-workbench-0.15.0.tgz`。
3. 等安装完成后重启应用。
4. 切到左侧栏顶部的 **Work** 模式，出现 **Hypit 视频工作台**（Bot 模式下不显示）。

## 二、命令行安装

把 `<profile>` 换成你的 profile 名（桌面端通常是 `desktop`）：

```bash
dsh plugin --profile <profile> add /绝对路径/dsh-hypit-workbench-0.15.0.tgz
```

装完确认配置层已合成：

```bash
dsh --profile <profile> --dump-config | grep -A 5 hypit-workbench
```

应看到：

```yaml
# == dsh-hypit-workbench
- id: hypit-workbench
  name: dsh-hypit-workbench
  config:
    roots:
      - ~/Hypit
```

然后重启应用。

## 三、准备 Hypit 本身

插件只负责看和交接，真正制作视频还需要 Hypit 的技能和执行器：

```bash
npx skills add hypit-ai/hypit -g --agent universal -y
```

执行器从 npm 装，**必须指定官方源**（国内镜像缺 `@hypit/html-document`）：

```bash
npm install --global @hypit/hypit --registry=https://registry.npmjs.org
hypit version   # 期望输出 @hypit/hypit 0.3.x
```

面板顶部的三个状态会如实反映结果：**执行器**、**技能**、**Node**。至少需要 Node 22.15。

## 四、指向你的视频项目

面板默认扫描 `~/Hypit`；第一次打开时如果它不存在，插件会自动建好（只对主目录内的路径生效）。如果你的项目在别处：

- 临时：在面板顶部「扫描根目录」里填路径（每行一个，支持 `~`），点 **扫描**；
- 长期：改 profile 里 `cordis.patch.yml` 的 `roots`。

一个目录要能被识别成 Hypit 项目，需要它自己的 `package.json` 里有：

```json
{ "hypit": { "project": true } }
```

扫描不会进入 `node_modules`、`.git`、`dist` 等目录，也不会写入你的项目。

## 五、卸载

```bash
dsh plugin --profile <profile> remove dsh-hypit-workbench
```

或在插件页里移除。

## 排查

| 现象 | 处理 |
| --- | --- |
| 左侧栏没有入口 | 先切到 **Work** 模式（入口和「大脑」「网感口播」放在一起）；再确认装的是当前 profile，改完 profile 必须重启应用 |
| 根目录提示「不存在」 | 主目录内的默认目录会自动创建；外置盘或系统目录需要你自己先建 |
| 「执行器 未找到 hypit」 | 执行器没装或不在 PATH；这不是面板故障，面板只读检查结果 |
| 扫描后没有项目 | 检查目标目录的 `package.json` 是否有 `"hypit": { "project": true }`，或根目录填得太上层/太下层 |
| 根目录提示「不能扫描 DSH 的配置目录」 | 禁止把 `~/.dsh` 或整个主目录当扫描根，请指向具体视频目录 |
| 点「在对话中开始」没有反应 | 面板会新建对话并切过去；若停在原页，左侧对话列表里会有一条新草稿 |
