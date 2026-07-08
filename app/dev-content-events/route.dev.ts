import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const contentDirs = ['posts', 'collections'].map((dir) => path.join(process.cwd(), dir))
const pollIntervalMs = 350
const stablePollCount = 4

function collectMarkdownFiles(dir: string, files: string[] = []) {
  if (!fs.existsSync(dir)) {
    return files
  }

  let entries: fs.Dirent[]
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return files
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      collectMarkdownFiles(fullPath, files)
      continue
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      try {
        const stat = fs.statSync(fullPath)
        files.push(`${path.relative(process.cwd(), fullPath)}:${stat.size}:${stat.mtimeMs}`)
      } catch {
        continue
      }
    }
  }

  return files
}

function getContentSignature() {
  const files = contentDirs.flatMap((dir) => collectMarkdownFiles(dir)).sort().join('|')
  return crypto.createHash('sha1').update(files).digest('hex')
}

export function GET(request: Request) {
  const encoder = new TextEncoder()
  let currentSignature = getContentSignature()
  let pendingSignature = currentSignature
  let stableCount = 0
  let interval: ReturnType<typeof setInterval> | undefined
  let closed = false

  const stream = new ReadableStream({
    start(controller) {
      function send(event: string, data: unknown) {
        if (closed) {
          return
        }

        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        )
      }

      function cleanup() {
        if (closed) {
          return
        }

        closed = true
        if (interval) {
          clearInterval(interval)
        }

        controller.close()
      }

      send('ready', { signature: currentSignature })

      interval = setInterval(() => {
        const nextSignature = getContentSignature()
        if (nextSignature === currentSignature) {
          pendingSignature = nextSignature
          stableCount = 0
          return
        }

        if (nextSignature !== pendingSignature) {
          pendingSignature = nextSignature
          stableCount = 1
          return
        }

        stableCount += 1
        if (stableCount < stablePollCount) {
          return
        }

        currentSignature = nextSignature
        stableCount = 0
        send('content-change', { signature: currentSignature })
      }, pollIntervalMs)

      request.signal.addEventListener('abort', cleanup, { once: true })
    },
    cancel() {
      closed = true
      if (interval) {
        clearInterval(interval)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream; charset=utf-8',
      'X-Accel-Buffering': 'no',
    },
  })
}
