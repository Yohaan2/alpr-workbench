import BboxCanvas from './BboxCanvas'
import MetaCards from './MetaCards'

/**
 * Panel de resultados visible tras una respuesta exitosa.
 * Layout de dos columnas + fila inferior de metadata cards.
 */
export default function ResultPanel({ imageSrc, parsed }) {
  const {
    vehicleBox,
    plateBox,
    vehicleConfidence,
    plateConfidence,
    plateText,
    timestamp
  } = parsed

  const confidencePct = (vehicleConfidence * 100).toFixed(1)
  const validated = plateConfidence > 0.85

  const ts = timestamp ? new Date(timestamp) : new Date()
  const tsLabel = formatTimestamp(ts)
  const cameraId = parsed.cameraId || '—'

  return (
    <div className="result">
      <div className="result__grid">
        {/* Columna izquierda: imagen original con bbox */}
        <section className="panel result__main">
          <span className="badge badge--cyan result__badge-tl">VEHICLE_DETECTED</span>

          <div className="result__canvas-wrap">
            <BboxCanvas src={imageSrc} box={vehicleBox} mode="overlay" />
            <span className="badge badge--confidence">{confidencePct}% CONFIDENCE</span>
          </div>

          <div className="result__meta-row">
            <div>
              <span className="result__meta-label">TIMESTAMP</span>
              <span className="result__meta-value">{tsLabel}</span>
            </div>
            <div className="result__meta-right">
              <span className="result__meta-label">CAMERA_ID</span>
              <span className="result__meta-value">{cameraId}</span>
            </div>
          </div>
        </section>

        {/* Columna derecha: crop de la placa */}
        <section className="panel result__plate">
          <span className="result__plate-label">CROP_VIEW [PLATE_SEGMENT]</span>

          <div className="result__crop">
            {parsed.cropImageBase64 ? (
              <img
                src={parsed.cropImageBase64}
                alt="License Plate Crop"
                className="result__crop-img"
                style={{
                  maxWidth: '100%',
                  maxHeight: '120px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  borderRadius: '4px',
                  border: '1px solid #30363d'
                }}
              />
            ) : plateBox ? (
              <BboxCanvas src={imageSrc} box={plateBox} mode="crop" maxWidth={420} />
            ) : (
              <div className="result__crop-empty">NO_PLATE_BBOX</div>
            )}
          </div>

          <span className="result__decoded-label">DECODED_TEXT</span>
          <div className="result__plate-text">{formatPlate(plateText)}</div>

          {validated && (
            <div className="result__status-badges">
              <span className="badge badge--green">MATCHED</span>
              <span className="badge badge--teal">VALIDATED</span>
            </div>
          )}
        </section>
      </div>

      <MetaCards parsed={parsed} />
    </div>
  )
}

function formatPlate(text) {
  if (!text || text === '—') return '—'
  // Inserta un guion entre la parte alfabética y numérica si no existe.
  if (/^[A-Z]+\d+$/i.test(text)) {
    return text.replace(/^([A-Z]+)(\d+)$/i, '$1-$2').toUpperCase()
  }
  return text.toUpperCase()
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}
