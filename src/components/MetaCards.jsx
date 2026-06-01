/**
 * Fila de tarjetas de metadata del vehículo.
 */
function cap(str) {
  if (!str) return null
  return String(str).charAt(0).toUpperCase() + String(str).slice(1)
}

export default function MetaCards({ parsed }) {
  const { attributes, speed } = parsed

  const make = cap(attributes?.make) || '—'
  const color = cap(attributes?.color) || '—'

  const model = cap(attributes?.model)
  const body = attributes?.body_type || attributes?.bodyType
  const classification = [model, body && `(${body})`].filter(Boolean).join(' ') || '—'

  const speedEst = speed ? speed : '—'

  return (
    <div className="metacards">
      <Card label="VEHICLE_MAKE" value={make} />
      <Card label="COLOR" value={color} swatch={attributes?.color} />
      <Card label="CLASSIFICATION" value={classification} />
      <Card label="SPEED_EST" value={speedEst} />
    </div>
  )
}

function Card({ label, value, swatch }) {
  return (
    <div className="metacard">
      <span className="metacard__label">{label}</span>
      <span className="metacard__value">
        {swatch && <span className="metacard__swatch" style={{ background: cssColor(swatch) }} />}
        {value}
      </span>
    </div>
  )
}

function cssColor(name) {
  const map = {
    gray: '#8b949e',
    grey: '#8b949e',
    silver: '#c0c0c0',
    black: '#2d2d2d',
    white: '#e6e6e6',
    red: '#e5484d',
    blue: '#3b82f6',
    green: '#30a46c',
    yellow: '#f5d90a',
    orange: '#f76808'
  }
  return map[String(name).toLowerCase()] || '#8b949e'
}
