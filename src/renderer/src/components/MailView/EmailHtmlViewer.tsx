import React, { useEffect, useMemo, useRef } from 'react'

interface Props {
  html: string
  className?: string
  messageId?: string
  zoom?: number
}

// Lazy-load DOMPurify only in the renderer (avoid bundling in main)
function useSanitizedHtml(html: string): string {
  return useMemo(() => {
    // Lightweight, email-friendly sanitizer
    const template = document.createElement('template')
    template.innerHTML = html

    const allowedSrcProtocols = ['http:', 'https:', 'data:', 'cid:', 'mailto:', 'tel:']

    const walk = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tag = el.tagName.toLowerCase()
        // Remove dangerous containers entirely
        if (['script', 'iframe', 'frame', 'object', 'embed', 'link'].includes(tag)) {
          el.remove()
          return
        }
        // Strip inline event handlers
        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase()
          if (name.startsWith('on')) {
            el.removeAttribute(attr.name)
          }
          if (name === 'style' && attr.value) {
            const v = attr.value.toLowerCase()
            if (
              v.includes('expression(') ||
              v.includes('javascript:') ||
              v.includes('url(javascript:') ||
              v.includes('-moz-binding') ||
              v.includes('behavior:')
            ) {
              el.removeAttribute('style')
              continue
            }
          }
          if ((name === 'href' || name === 'src') && attr.value) {
            try {
              // Handle cid: specially (URL constructor throws for it)
              if (attr.value.startsWith('cid:')) continue
              const url = new URL(attr.value, 'http://localhost')
              if (!allowedSrcProtocols.includes(url.protocol)) {
                el.removeAttribute(attr.name)
              }
            } catch {
              // If parsing fails and it's not cid:, drop it
              if (!attr.value.startsWith('cid:')) {
                el.removeAttribute(attr.name)
              }
            }
          }
        }
      }
      for (const child of Array.from(node.childNodes)) walk(child)
    }

    walk(template.content)
    return template.innerHTML
  }, [html])
}

const EmailHtmlViewer: React.FC<Props> = ({ html, className, messageId, zoom = 1 }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sanitized = useSanitizedHtml(html)

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    // Prepare a basic HTML document with CSS normalization for email
    const doc = iframe.contentDocument
    if (!doc) return

    doc.open()
    doc.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
          <base target="_blank" />
          <style>
            /* Reset and constrain images/tables typical to email */
            html, body { margin: 0; padding: 0; }
            body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif; color: #1f2937; }
            img { max-width: 100%; height: auto !important; }
            table { max-width: 100%; border-collapse: collapse; }
            iframe, object, embed { display: none !important; }
            /* Ensure dark backgrounds in emails don't blow up */
            .ExternalClass { width: 100%; }
            .ReadMsgBody { width: 100%; }
            a { color: #2563eb; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div id="root">${sanitized}</div>
        </body>
      </html>`)
    doc.close()

    // Resolve cid: images by asking main process
    type IpcRendererLike = {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    }
    const w = window as unknown as { electron?: { ipcRenderer?: IpcRendererLike } }
    const ipcRenderer = w.electron?.ipcRenderer
    if (messageId && ipcRenderer) {
      ipcRenderer
        .invoke('gmail:resolveCidImages', messageId)
        .then((value: unknown) => {
          const map = (value || {}) as Record<string, string>
          if (!iframe.contentDocument) return
          const imgs = iframe.contentDocument.querySelectorAll('img[src^="cid:"]')
          imgs.forEach((img) => {
            const cid = img.getAttribute('src')?.slice(4)
            if (cid && map[cid]) {
              img.setAttribute('src', map[cid])
            }
          })
        })
        .catch(() => {
          // ignore failures
        })
    }

    // Attach click handler from parent to keep sandbox content script-free
    const onDocClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const anchor = target.closest('a') as HTMLAnchorElement | null
      if (anchor && anchor.href) {
        e.preventDefault()
        window.postMessage({ type: 'email-link-click', href: anchor.href }, '*')
      }
    }
    doc.addEventListener('click', onDocClick, true)

    // Auto-resize iframe to content height
    const resize = (): void => {
      if (!iframe.contentDocument) return
      const body = iframe.contentDocument.body
      if (!body) return
      // Match the layout height to visual scale to avoid overlapping the composer
      iframe.style.height = `${body.scrollHeight * zoom}px`
    }
    const hasRO =
      typeof (window as unknown as { ResizeObserver?: unknown }).ResizeObserver !== 'undefined'
    let ro: unknown
    if (hasRO) {
      const RO = (window as unknown as { ResizeObserver: new (cb: () => void) => unknown })
        .ResizeObserver
      ro = new RO(() => resize())
      ;(ro as { observe: (el: Element) => void }).observe(doc.body)
    } else {
      // Fallback polling
      const interval = setInterval(resize, 300)
      const cleanup = (): void => clearInterval(interval)
      iframe.addEventListener('load', cleanup, { once: true })
    }
    resize()

    // Listen for link clicks from iframe
    const onMsg = (ev: MessageEvent): void => {
      if (!ev.data || ev.data.type !== 'email-link-click') return
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { ipcRenderer } = (window as any).electron || {}
        if (ipcRenderer) {
          // We can ask main to open externally via window.open handler
          window.open(ev.data.href, '_blank')
        } else {
          // In browser preview fallback
          window.open(ev.data.href, '_blank', 'noopener')
        }
      } catch {
        // noop
      }
    }
    window.addEventListener('message', onMsg)
    return () => {
      window.removeEventListener('message', onMsg)
      doc.removeEventListener('click', onDocClick, true)
      if (ro && (ro as { disconnect?: () => void }).disconnect) {
        ;(ro as { disconnect: () => void }).disconnect()
      }
    }
  }, [sanitized, messageId, zoom])

  return (
    <iframe
      ref={iframeRef}
      title="email-html"
      className={className}
      style={{
        width: '100%',
        border: 'none',
        background: 'transparent',
        transform: `scale(${zoom})`,
        transformOrigin: '0 0'
      }}
      sandbox="allow-same-origin allow-popups"
    />
  )
}

export default EmailHtmlViewer
