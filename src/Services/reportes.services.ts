import fs from 'fs'
import path from 'path'

// Apuntar directamente a la carpeta uploads pública
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

export const procesarMedia = async (ctx: any, provider: any) => {
  const body = ctx?.body ?? ''
  
  const isImage = Boolean(ctx.message?.imageMessage || body.includes('_event_image_'))
  const isVideo = Boolean(ctx.message?.videoMessage || body.includes('_event_video_'))
  const isAudio = Boolean(ctx.message?.audioMessage || body.includes('_event_voice_') || body.includes('_event_audio_'))
  const isDocument = Boolean(ctx.message?.documentMessage || body.includes('_event_document_'))

  if (!isImage && !isVideo && !isAudio && !isDocument) return null

  let tipoMensaje = 'DOCUMENT'
  if (isImage) tipoMensaje = 'IMAGE'
  else if (isVideo) tipoMensaje = 'VIDEO'
  else if (isAudio) tipoMensaje = 'AUDIO'

  try {
    // 1. Guardar archivo directamente en uploads
    const localPath = await provider.saveFile(ctx, { path: UPLOADS_DIR })
    if (!localPath) return null

    let finalPath = localPath

    // 2. Renombrar audio para asegurar compatibilidad de reproducción HTML5
    if (isAudio && !localPath.endsWith('.mp3')) {
      const mp3Path = localPath.replace(/\.[^/.]+$/, '') + '.mp3'
      fs.renameSync(localPath, mp3Path)
      finalPath = mp3Path
    }

    const fileName = path.basename(finalPath)

    return {
      tipoMensaje,
      fileName,
      relativePath: `uploads/${fileName}`
    }
  } catch (error) {
    console.error('❌ Error guardando archivo multimedia:', error)
    return null
  }
}