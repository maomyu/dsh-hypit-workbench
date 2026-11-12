/**
 * Every model or key entry in this workbench jumps straight to DSH settings,
 * the same way 生图工作台's 模型 button does:
 *   - conversation models → host 设置 → 模型
 *   - image / video / data keys → 设置 → 接口与密钥 (dsh-media-providers)
 * No local copies of model or key settings.
 */

const MODELS_LABELS = ['模型', 'Models']

function clickWhenReady(pick) {
  const tryPick = () => {
    const node = pick()
    if (!node) return false
    if (node.getAttribute('aria-current') !== 'true') node.click()
    return true
  }
  if (tryPick()) return true
  let frames = 0
  const look = () => {
    if (tryPick()) return
    if (++frames < 45) requestAnimationFrame(look)
  }
  requestAnimationFrame(look)
  return true
}

/** Image/video/data keys. Returns false when the keys plugin is missing. */
export function openKeySettings(focus) {
  const hub = globalThis.__dshMediaProviders
  if (hub?.open) { hub.open(focus); return true }
  return false
}

/**
 * Host 设置 → 模型. Prefer the keys plugin's helper (it owns the host-panel
 * plumbing); fall back to the settings shortcut and the nav row label.
 */
export function openModelSettings() {
  const hub = globalThis.__dshMediaProviders
  if (hub?.openModels) return hub.openModels()
  const row = () => [...document.querySelectorAll('nav button, [role="dialog"] button')].find(node => MODELS_LABELS.includes(node.textContent?.trim()))
  if (row()) return clickWhenReady(row)
  // ⌘, opens settings in the desktop app; then pick the 模型 row.
  try {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: ',', code: 'Comma', metaKey: true, bubbles: true }))
  } catch {}
  return clickWhenReady(row)
}
