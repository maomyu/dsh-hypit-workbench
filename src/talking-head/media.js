const decode = data => Uint8Array.from(atob(data), char => char.charCodeAt(0))

// Bound RPC concurrency, while retaining byte order for the final media Blob.
export async function loadMediaParts(request, signal, progress) {
  signal?.throwIfAborted()
  const first = await request(0)
  if (!Number.isSafeInteger(first.size) || first.next < 1 || first.next > first.size) throw new Error('视频数据不完整，请刷新后重试')
  const parts = [decode(first.data)], step = first.next
  let cursor = first.next, loaded = first.next
  progress?.(Math.round(loaded / first.size * 100))
  const worker = async () => {
    while (cursor < first.size) {
      signal?.throwIfAborted()
      const offset = cursor
      cursor = Math.min(first.size, cursor + step)
      const part = await request(offset)
      if (part.size !== first.size || part.next !== Math.min(first.size, offset + step)) throw new Error('视频数据发生变化，请刷新后重试')
      parts[offset / step] = decode(part.data)
      loaded += part.next - offset
      progress?.(Math.round(loaded / first.size * 100))
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, Math.ceil((first.size - first.next) / step)) }, worker))
  signal?.throwIfAborted()
  return { parts, mime: first.mime }
}
