import { useMemo, useState } from 'react'

/**
 * Panel colapsable con el JSON crudo de la respuesta.
 * Incluye syntax highlighting básico, copiar al clipboard y descargar .json
 */
export default function RawJson({ data, open, onToggle }) {
  const [copied, setCopied] = useState(false)

  const jsonString = useMemo(() => JSON.stringify(data ?? {}, null, 2), [data])
  const highlighted = useMemo(() => highlight(jsonString), [jsonString])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard no disponible */
    }
  }

  const handleDownload = () => {
    const ts = new Date().toISOString().replace(/[:.]/g, '-')
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `alpr-response-${ts}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className={`rawjson ${open ? '' : 'rawjson--collapsed'}`}>
      <header className="rawjson__head">
        <button className="rawjson__title" onClick={onToggle} title="Collapse / expand">
          <span className="rawjson__brace">{'{ }'}</span>
          RAW_JSON_PAYLOAD
        </button>
        {open && (
          <div className="rawjson__actions">
            <button className="icon-btn" onClick={handleCopy} title="Copy to clipboard">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
            <button className="icon-btn" onClick={handleDownload} title="Download .json">
              <DownloadIcon />
            </button>
          </div>
        )}
      </header>

      {open && (
        <pre className="rawjson__body">
          <code dangerouslySetInnerHTML={{ __html: highlighted }} />
        </pre>
      )}
    </aside>
  )
}

/** Syntax highlighting básico vía regex sobre el JSON serializado. */
function highlight(json) {
  const escaped = json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'tok-number'
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'tok-key' : 'tok-string'
      } else if (/true|false/.test(match)) {
        cls = 'tok-bool'
      } else if (/null/.test(match)) {
        cls = 'tok-null'
      }
      return `<span class="${cls}">${match}</span>`
    }
  )
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#30a46c" strokeWidth="2.2">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4" />
      <path d="M5 21h14" />
    </svg>
  )
}
