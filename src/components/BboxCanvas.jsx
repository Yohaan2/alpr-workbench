import { useEffect, useRef } from 'react'
import { drawBbox } from '../utils/drawBbox'

/**
 * Renderiza una imagen en un canvas con dos modos:
 *  - mode="overlay": dibuja la imagen completa y un bounding box encima.
 *  - mode="crop": recorta y amplía únicamente la región del bbox.
 *
 * @param {string} src - Object URL o data URL de la imagen.
 * @param {{x,y,w,h}|null} box - Caja normalizada en coords de la imagen original.
 * @param {'overlay'|'crop'} mode
 * @param {string} [color] - Color del bbox en modo overlay.
 */
export default function BboxCanvas({ src, box, mode = 'overlay', color = '#22d3ee', maxWidth = 760 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!src) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.onload = () => {
      if (mode === 'crop' && box && box.w > 0 && box.h > 0) {
        renderCrop(canvas, ctx, img, box, maxWidth)
      } else {
        renderOverlay(canvas, ctx, img, box, color, maxWidth)
      }
    }
    img.src = src

    return () => {
      img.onload = null
    }
  }, [src, box, mode, color, maxWidth])

  return <canvas ref={canvasRef} className="bbox-canvas" />
}

function renderOverlay(canvas, ctx, img, box, color, maxWidth) {
  const scale = Math.min(1, maxWidth / img.naturalWidth)
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)

  canvas.width = w
  canvas.height = h
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, 0, 0, w, h)

  if (box) {
    drawBbox(ctx, box, { scale, color })
  }
}

function renderCrop(canvas, ctx, img, box, maxWidth) {
  // Padding alrededor del recorte para dar contexto visual.
  const pad = Math.round(Math.max(box.w, box.h) * 0.12)
  const sx = Math.max(0, box.x - pad)
  const sy = Math.max(0, box.y - pad)
  const sw = Math.min(img.naturalWidth - sx, box.w + pad * 2)
  const sh = Math.min(img.naturalHeight - sy, box.h + pad * 2)

  const scale = Math.min(maxWidth / sw, 1.6)
  const w = Math.round(sw * scale)
  const h = Math.round(sh * scale)

  canvas.width = w
  canvas.height = h
  ctx.clearRect(0, 0, w, h)
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h)
}
