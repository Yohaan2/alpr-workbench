/**
 * Normaliza un bbox que puede venir como [x1, y1, x2, y2] (esquinas)
 * o como [x, y, w, h] (origen + tamaño) a un objeto {x, y, w, h}.
 *
 * Heurística: si los dos últimos valores son mayores que los dos primeros,
 * asumimos formato de esquinas [x1, y1, x2, y2].
 *
 * @param {number[]} bbox
 * @returns {{x:number,y:number,w:number,h:number}|null}
 */
export function normalizeBbox(bbox) {
  if (!Array.isArray(bbox) || bbox.length < 4) return null
  const [a, b, c, d] = bbox.map(Number)

  if (c > a && d > b) {
    // Formato esquinas [x1, y1, x2, y2]
    return { x: a, y: b, w: c - a, h: d - b }
  }
  // Formato [x, y, w, h]
  return { x: a, y: b, w: c, h: d }
}

/**
 * Extrae las detecciones de vehículo y placa de una respuesta del servicio ALPR.
 * El resto de la app consume únicamente lo que devuelve este util, así que si
 * el formato de tu servicio difiere, este es el único archivo que debes adaptar.
 *
 * @param {object} response - Respuesta cruda del servicio ALPR.
 * @returns {{
 *   vehicle: object|null,
 *   plate: object|null,
 *   vehicleBox: object|null,
 *   plateBox: object|null,
 *   attributes: object,
 *   plateText: string,
 *   plateConfidence: number,
 *   vehicleConfidence: number,
 *   timestamp: number|null,
 *   cameraId: string|null,
 *   speed: string|null
 * }}
 */
export function parseResponse(response) {
  // Extrae la detección de placa de yolo-v8-lpr o de cropper
  const yoloDetections = response?.results?.['yolo-v8-lpr']?.detections || []
  const cropperCrops = response?.results?.['cropper']?.crops || []
  const ocrResults = response?.results?.['parseq-ocr']?.results || []

  // Buscamos la primera placa detectada
  const plateDetection = yoloDetections.find((d) => d?.class === 'license_plate') || cropperCrops.find((c) => c?.class === 'license_plate') || null

  // Parseq-ocr tiene el texto final y confianza, además del base64 de la placa
  const ocrResult = ocrResults[0] || null

  // Si viene una imagen en base64 de parseq-ocr, la preparamos como Data URL para que se renderice directamente
  const cropImageBase64 = ocrResult?.image_base64 ? `data:image/png;base64,${ocrResult.image_base64}` : null

  return {
    vehicle: null,
    plate: plateDetection,
    vehicleBox: null,
    plateBox: plateDetection ? normalizeBbox(plateDetection.bbox) : null,
    attributes: {},
    plateText: ocrResult?.text || '—',
    plateRegion: null,
    plateConfidence: typeof ocrResult?.confidence === 'number' ? ocrResult.confidence : (plateDetection?.confidence || 0),
    vehicleConfidence: 0,
    timestamp: null,
    cameraId: null,
    speed: null,
    cropImageBase64
  }
}
