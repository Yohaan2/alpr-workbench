import { useCallback, useState } from 'react'

const ENDPOINT = import.meta.env.VITE_ALPR_ENDPOINT

/**
 * Hook para consumir el servicio ALPR.
 * Hace POST multipart/form-data con el campo `image` directamente desde el browser.
 *
 * Estados: 'idle' | 'loading' | 'success' | 'error'
 */
export function useAlpr() {
  const [status, setStatus] = useState('idle')
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const analyze = useCallback(async (file) => {
    if (!file) return

    if (!ENDPOINT) {
      setStatus('error')
      setError({
        message: 'VITE_ALPR_ENDPOINT no está configurado. Define el endpoint en .env.local'
      })
      return
    }

    setStatus('loading')
    setError(null)
    setData(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body: formData
      })

      const bodyText = await res.text()

      if (!res.ok) {
        setStatus('error')
        setError({
          status: res.status,
          statusText: res.statusText,
          body: bodyText
        })
        return
      }

      let parsed
      try {
        parsed = bodyText ? JSON.parse(bodyText) : {}
      } catch (e) {
        setStatus('error')
        setError({
          status: res.status,
          message: 'La respuesta no es un JSON válido.',
          body: bodyText
        })
        return
      }

      setData(parsed)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError({
        message: err?.message || 'Error de red al contactar el servicio ALPR.',
        detail: 'Verifica que el servicio tenga CORS habilitado y esté accesible.'
      })
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setData(null)
    setError(null)
  }, [])

  return { status, data, error, analyze, reset }
}
