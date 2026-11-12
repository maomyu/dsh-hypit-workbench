/**
 * 口播生图的接口与密钥由「接口与密钥」插件（服务 `mediaProviders`）统一管理。
 * 这里只把那边的 Seedream 设置映射成口播素材流程原来使用的形状；
 * 密钥不经过这个插件，也不再写入口播目录。
 */

export const HUB_MISSING = '口播生图需要「接口与密钥」插件来管理模型和密钥；请先在插件管理里启用它，再到「设置 → 接口与密钥」填写 Seedream。'
const PROVIDER = 'seedream'

/** Settings view for the panel and the agent context. Never contains a key. */
export class ImageSettings {
  constructor(hub) {
    this.hub = typeof hub === 'function' ? hub : () => hub
  }

  async read() {
    const hub = this.hub()
    if (!hub) return { configured: false, hub: false, provider: PROVIDER, model: '', size: '2K', route: '' }
    const [status, settings] = await Promise.all([hub.status(), hub.settings('image', PROVIDER)])
    return {
      configured: Boolean(status?.image?.[PROVIDER]),
      hub: true,
      provider: PROVIDER,
      product: settings?.product || 'Seedream',
      model: settings?.model || '',
      size: settings?.defaults?.size || '2K',
      route: settings?.baseUrl || '',
    }
  }

  async view() {
    const value = await this.read()
    return { ...value, managedBy: '设置 → 接口与密钥' }
  }
}

function classify(error) {
  const out = new Error(error?.message || '生图服务请求失败')
  out.uncertain = Boolean(error?.uncertain)
  out.details = error?.details
  return out
}

/**
 * One image through the hub. Same contract the asset pipeline always used:
 * `{ bytes, mime, suffix, model, requestId }`, errors carry `uncertain`.
 */
export async function requestImage(settings, prompt, { signal, references = [], hub } = {}) {
  const service = typeof hub === 'function' ? hub() : hub
  if (!service) throw new Error(HUB_MISSING)
  if (!settings?.configured) throw new Error('请先在「设置 → 接口与密钥」配置 Seedream 密钥')
  let result
  try {
    result = await service.generateImage({
      provider: PROVIDER,
      prompt,
      count: 1,
      size: settings.size,
      referenceImages: references,
      signal,
      caller: '视频工作台 · 网感口播',
    })
  } catch (error) {
    throw classify(error)
  }
  const image = result.images?.[0]
  if (!image) throw new Error('生图服务没有返回图片')
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(image.mime)) throw new Error('生图返回的文件不是 PNG、JPEG 或 WebP')
  return { bytes: image.buffer, mime: image.mime, suffix: image.suffix, model: result.model || settings.model, requestId: result.requestId || '' }
}
