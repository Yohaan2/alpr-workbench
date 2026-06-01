import { useEffect, useMemo, useRef, useState } from 'react'
import DropZone from './components/DropZone'
import ResultPanel from './components/ResultPanel'
import RawJson from './components/RawJson'
import { useAlpr } from './hooks/useAlpr'
import { parseResponse } from './utils/parseResponse'

const NAV_ITEMS = ['Dashboard', 'Monitor', 'Reports', 'History']

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
      {/* ---------- Sidebar ---------- */}
      <aside className="sidebar">
        <div className="sidebar__brand">
          <div className="sidebar__logo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
              <rect x="3" y="7" width="18" height="10" rx="2" />
              <path d="M7 11h2m2 0h2m2 0h2" />
            </svg>
          </div>
          <div>
            <div className="sidebar__title">ALPR Workbench</div>
            <div className="sidebar__subtitle">OPERATIONAL NODE 01</div>
          </div>
        </div>

        <nav className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              className={`nav-item ${item === 'Monitor' ? 'nav-item--active' : ''}`}
            >
              <NavIcon name={item} />
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar__footer">
          <button className="btn btn--primary btn--block" onClick={handleNewAnalysis}>
            New Analysis
          </button>
          <button className="nav-item nav-item--muted">
            <NavIcon name="Settings" /> Settings
          </button>
          <button className="nav-item nav-item--muted">
            <NavIcon name="Support" /> Support
          </button>
        </div>
      </aside>

      {/* ---------- Main column ---------- */}
      <div className="main">
        <header className="topbar">
          <div className="topbar__left">
            <span className="topbar__system">OPTRA System</span>
            <span className="topbar__event">EVENT_LOG_3392</span>
          </div>

          <div className="topbar__search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6e7681" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4-4" />
            </svg>
            <input placeholder="Search vehicle tags…" />
          </div>

          <div className="topbar__right">
            <button className="btn btn--primary" onClick={() => openPickerRef.current?.()} disabled={loading}>
              Upload Image
            </button>
            <button className="icon-btn" title="Notifications"><BellIcon /></button>
            <button className="icon-btn" title="Settings"><GearIcon /></button>
            <button className="icon-btn icon-btn--avatar" title="User"><UserIcon /></button>
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

/* ---------- Iconos inline ---------- */
function NavIcon({ name }) {
  const common = { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8 }
  switch (name) {
    case 'Dashboard':
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
    case 'Monitor':
      return <svg {...common}><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
    case 'Reports':
      return <svg {...common}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></svg>
    case 'History':
      return <svg {...common}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" /></svg>
    case 'Settings':
      return <GearIcon />
    case 'Support':
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4M12 17h.01" /></svg>
    default:
      return null
  }
}

function BellIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></svg>
}
function GearIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15H4.5a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 6 9.4l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 11 6.6V4.5a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 18 6.6l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 21 12.6h.09a2 2 0 1 1 0 4z" /></svg>
}
function UserIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
}
