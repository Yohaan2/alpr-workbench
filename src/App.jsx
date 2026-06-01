import { useEffect, useMemo, useRef, useState } from 'react'
import DropZone from './components/DropZone'
import ResultPanel from './components/ResultPanel'
import RawJson from './components/RawJson'
import { useAlpr } from './hooks/useAlpr'
import { parseResponse } from './utils/parseResponse'

export default function App() {
  const { status, data, error, analyze, reset } = useAlpr()
  const [imageSrc, setImageSrc] = useState(null)
  const [rawOpen, setRawOpen] = useState(true)
  const openPickerRef = useRef(null)

  const loading = status === 'loading'

  const handleFile = (file) => {
    // Revoca el object URL anterior para evitar fugas de memoria.
    if (imageSrc) URL.revokeObjectURL(imageSrc)
    setImageSrc(URL.createObjectURL(file))
    analyze(file)
  }

  const handleNewAnalysis = () => {
    if (imageSrc) URL.revokeObjectURL(imageSrc)
    setImageSrc(null)
    reset()
  }

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const parsed = useMemo(
    () => (status === 'success' && data ? parseResponse(data) : null),
    [status, data]
  )

  return (
    <div className="app">
      {/* ---------- Main column ---------- */}
      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <div>
              <span className="topbar__system">ALPR Workbench</span>
              <span className="topbar__description">License Plate Recognition Analysis Tool</span>
            </div>
          </div>

          <div className="topbar__right" style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <button className="btn btn--primary" onClick={handleNewAnalysis} disabled={loading}>
              New Analysis
            </button>
          </div>
        </header>

        <div className="content">
          <main className="workspace">
            {/* DropZone siempre visible en la parte superior (compacta tras un resultado). */}
            <div className={parsed ? 'dropzone-slot dropzone-slot--compact' : 'dropzone-slot'}>
              <DropZone
                onFile={handleFile}
                disabled={loading}
                registerOpen={(fn) => (openPickerRef.current = fn)}
              />
            </div>

            {loading && (
              <div className="state state--loading">
                <div className="spinner" />
                <span>Querying ALPR service…</span>
              </div>
            )}

            {status === 'error' && error && (
              <div className="state state--error">
                <strong>Request failed</strong>
                {error.status && (
                  <span className="state__code">HTTP {error.status} {error.statusText || ''}</span>
                )}
                {error.message && <p>{error.message}</p>}
                {error.detail && <p className="state__detail">{error.detail}</p>}
                {error.body && <pre className="state__body">{error.body}</pre>}
              </div>
            )}

            {status === 'success' && parsed && (
              <ResultPanel imageSrc={imageSrc} parsed={parsed} />
            )}

            {status === 'idle' && (
              <div className="state state--empty">
                <span>Drop a vehicle image to start an analysis</span>
              </div>
            )}
          </main>

          {/* Panel RAW_JSON solo cuando hay datos */}
          {status === 'success' && (
            <RawJson data={data} open={rawOpen} onToggle={() => setRawOpen((v) => !v)} />
          )}
        </div>
      </div>
    </div>
  )
}
