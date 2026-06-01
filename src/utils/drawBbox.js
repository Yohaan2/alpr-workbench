/**
 * Dibuja un rectángulo (bounding box) sobre un canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - Contexto 2D del canvas.
 * @param {{x:number,y:number,w:number,h:number}} box - Caja en coordenadas de la imagen original.
 * @param {object} [options]
 * @param {number} [options.scale=1] - Factor de escala entre la imagen original y el canvas dibujado.
 * @param {string} [options.color='#22d3ee'] - Color del borde.
 * @param {number} [options.lineWidth=2] - Grosor del borde.
 * @param {boolean} [options.corners=true] - Dibuja remates en las esquinas (estilo HUD).
 */
export function drawBbox(ctx, box, options = {}) {
  if (!ctx || !box) return

  const {
    scale = 1,
    color = '#22d3ee',
    lineWidth = 2,
    corners = true
  } = options

  const x = box.x * scale
  const y = box.y * scale
  const w = box.w * scale
  const h = box.h * scale

  ctx.save()

  // Rectángulo base
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.shadowColor = color
  ctx.shadowBlur = 8
  ctx.strokeRect(x, y, w, h)

  // Remates en esquinas estilo HUD
  if (corners) {
    const c = Math.min(18, w * 0.2, h * 0.2)
    ctx.shadowBlur = 0
    ctx.lineWidth = lineWidth + 1.5

    // Top-left
    line(ctx, x, y, x + c, y)
    line(ctx, x, y, x, y + c)
    // Top-right
    line(ctx, x + w, y, x + w - c, y)
    line(ctx, x + w, y, x + w, y + c)
    // Bottom-left
    line(ctx, x, y + h, x + c, y + h)
    line(ctx, x, y + h, x, y + h - c)
    // Bottom-right
    line(ctx, x + w, y + h, x + w - c, y + h)
    line(ctx, x + w, y + h, x + w, y + h - c)
  }

  ctx.restore()
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}
