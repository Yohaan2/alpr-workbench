import { useCallback, useEffect, useRef, useState } from 'react'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 15 * 1024 * 1024 // 15MB

/**
 * Zona de carga drag & drop. Acepta JPG/PNG/WEBP hasta 15MB.
 * Se deshabilita mientras hay un request en curso.
 */
export default function DropZone({ onFile, disabled, registerOpen }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState(null)

  const openPicker = useCallback(() => {
    if (!disabled) inputRef.current?.click()
  }, [disabled])

  // Permite que el header dispare el file picker de esta zona.
  useEffect(() => {
    if (registerOpen) registerOpen(openPicker)
  }, [registerOpen, openPicker])

  const validateAndSend = useCallback(
    (file) => {
      setLocalError(null)
      if (!file) return
      if (!ACCEPTED.includes(file.type)) {
        setLocalError('Formato no soportado. Usa JPG, PNG o WEBP.')
        return
      }
      if (file.size > MAX_SIZE) {
        setLocalError('La imagen supera el límite de 15MB.')
        return
      }
      onFile(file)
    },
    [onFile]
  )

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      if (disabled) return
      const file = e.dataTransfer.files?.[0]
      validateAndSend(file)
    },
    [disabled, validateAndSend]
  )

  const handleChange = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      validateAndSend(file)
      e.target.value = ''
    },
    [validateAndSend]
  )

  return (
    <div
      className={`dropzone ${dragOver ? 'dropzone--over' : ''} ${disabled ? 'dropzone--disabled' : ''}`}
      onClick={openPicker}
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        hidden
      />

      <div className="dropzone__icon" aria-hidden>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b949e" strokeWidth="1.8">
          <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
          <path d="M20 16.5A4.5 4.5 0 0 0 17 8h-1.26A7 7 0 1 0 4 14.9" />
        </svg>
      </div>

      <h2 className="dropzone__title">
        {disabled ? 'Analyzing image…' : 'Drag & Drop Vehicle Image'}
      </h2>
      <p className="dropzone__hint">Supported formats: JPG, PNG, WEBP (Max 15MB)</p>

      {localError && <p className="dropzone__error">{localError}</p>}
    </div>
  )
}
