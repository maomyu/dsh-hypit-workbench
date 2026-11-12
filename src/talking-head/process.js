import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

export function executable(name) {
  const candidates = [name, ...['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin'].map(root => path.join(root, name))]
  return candidates.slice(1).find(file => existsSync(file)) ?? candidates[0]
}

export function run(command, args, { signal, cwd, onLine, timeout = 3600000, env = {} } = {}) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted()
    const child = spawn(command, args, {
      cwd, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', ...env },
    })
    let output = ''
    let pending = ''
    let stopped = false
    const stop = () => {
      stopped = true
      try {
        if (process.platform === 'win32') child.kill('SIGTERM')
        else process.kill(-child.pid, 'SIGTERM')
      } catch { /* A child may finish while cancellation is delivered. */ }
    }
    const timer = setTimeout(stop, timeout)
    const drain = chunk => {
      const text = chunk.toString()
      output = (output + text).slice(-4 * 1024 * 1024)
      pending += text
      const parts = pending.split(/\r?\n/u)
      pending = parts.pop()
      for (const line of parts) onLine?.(line)
    }
    child.stdout.on('data', drain)
    child.stderr.on('data', drain)
    signal?.addEventListener('abort', stop, { once: true })
    child.once('error', finish)
    child.once('close', (code, termination) => finish(
      signal?.aborted ? new Error('任务已取消') : stopped ? new Error('任务超时')
        : code !== 0 ? new Error(output.trim().slice(-3000) || '进程退出 ' + (termination ?? code)) : null,
    ))
    function finish(error) {
      clearTimeout(timer)
      signal?.removeEventListener('abort', stop)
      if (error) reject(error)
      else resolve(output)
    }
  })
}
