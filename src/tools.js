import { defineTool } from '@deepseek-ai/dsh-tools'
import { LIMITS } from './store.js'
import { splitRoots } from './view.js'
import { askInPanel, describeAnswers } from './session-access.js'
import {
  checkProject,
  describeProjects,
  planProject,
} from './tool-logic.js'

const textOutput = {
  schema: { type: 'string' },
  render: (args, value) => [{ type: 'text', text: String(value ?? '') }],
}

function createProjectsTool(configuredRoots) {
  return defineTool({
    name: 'hypit_projects',
    description:
      '列出 Hypit 视频项目：按根目录扫描含 "hypit": { "project": true } 的目录，并报告 hypit 执行器、Hypit 技能和 Node 是否就绪。只读，不运行构建。对话里不确定项目路径或环境是否可用时先调用它。',
    parameters: {
      roots: {
        type: 'string',
        description: '可选。根目录列表，换行或逗号分隔，支持 ~。省略则使用插件配置的根目录。',
      },
    },
    output: textOutput,
    async execute(args) {
      try {
        const requested = splitRoots(args?.roots).slice(0, LIMITS.roots)
        const roots = requested.length ? requested : (configuredRoots.length ? configuredRoots : splitRoots('~/Hypit'))
        return await describeProjects(roots)
      } catch (error) {
        return `无法完成：${error?.message ?? error}`
      }
    },
  })
}

const checkTool = defineTool({
  name: 'hypit_check',
  description:
    '对 Hypit 项目的 SVML 源码运行 `hypit check`：本地语法与引用检查，不联网、不产生费用。返回真实命令、退出码和完整输出。改过 Source 后应调用它确认通过，再考虑 build。',
  parameters: {
    project: {
      type: 'string',
      description: '项目绝对路径。省略则用当前对话所在目录。',
    },
    source: {
      type: 'string',
      description: '相对项目根的 .svml 或 .svs 路径。省略则用项目里第一个源文件。',
    },
  },
  output: textOutput,
  execute: (args, exec) => checkProject(args, exec),
})

const planTool = defineTool({
  name: 'hypit_plan',
  description:
    '对 Hypit 项目的 .svrun 运行 `hypit plan`：列出这条 Run 的目标与将发起的请求数量，不提交构建、不产生费用。真要花钱前先用它说明范围，等用户确认再 build。',
  parameters: {
    project: {
      type: 'string',
      description: '项目绝对路径。省略则用当前对话所在目录。',
    },
    run: {
      type: 'string',
      description: '相对项目根的 .svrun 路径。省略则用最近修改的那条。',
    },
  },
  output: textOutput,
  execute: (args, exec) => planProject(args, exec),
})

/** Build the tool set for one service instance so defaults follow plugin config. */
export function createHypitTools(configuredRoots = []) {
  return [createProjectsTool(configuredRoots), checkTool, planTool]
}

/** `ask_user`: a question card rendered by the panel, answered there. */
export function createPanelQuestionTool(chat) {
  return defineTool({
    name: 'ask_user',
    description: '在视频工作台面板里向用户提一个或几个选择题，并等待回答。需要用户拍板（方向、取舍、是否花钱）时使用。每题 2–4 个选项，label 简短，description 写清后果；用户也可以写自定义回答或跳过。',
    parameters: {
      questions: {
        type: 'array',
        required: true,
        description: '要问的问题，通常 1 个，最多 3 个。',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string', required: true, description: '稳定 id，会在回答里带回。' },
            question: { type: 'string', required: true, description: '问题本身，一句话。' },
            header: { type: 'string', description: '可选的短标题，如「画面方向」。' },
            options: {
              type: 'array',
              description: '选项，推荐的放第一个。',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  label: { type: 'string', required: true, description: '选项文字，短。' },
                  description: { type: 'string', description: '一句话说明后果或取舍。' },
                },
              },
            },
            multi_select: { type: 'boolean', description: '是否可多选，默认否。' },
          },
        },
      },
    },
    output: {
      schema: { type: 'string' },
      render: (args, value) => [{ type: 'text', text: String(value ?? '') }],
    },
    async execute(args, exec) {
      const questions = (Array.isArray(args?.questions) ? args.questions : []).slice(0, 3).map((item, index) => ({
        id: String(item?.id || `q${index + 1}`),
        question: String(item?.question ?? ''),
        header: item?.header,
        options: Array.isArray(item?.options) ? item.options.slice(0, 6) : [],
        multiSelect: item?.multi_select === true || item?.multiSelect === true,
      })).filter(item => item.question)
      if (!questions.length) return '没有可问的问题：questions 不能为空。'
      try {
        const result = await askInPanel(chat, { questions, signal: exec?.signal })
        return describeAnswers(questions, result)
      } catch (error) {
        return `用户没有回答（${error?.message ?? '已中断'}）。不要假设答案，停下来说明你在等什么。`
      }
    },
  })
}
