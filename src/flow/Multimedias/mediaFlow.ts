import { addKeyword, EVENTS } from '@builderbot/bot'
import { procesarMedia } from '../../Services/reportes.services.js'

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:4000/v1'
const API_KEY = process.env.API_KEY || 'EmcaSecret2026'

export const mediaFlow = addKeyword([
  EVENTS.MEDIA,
  EVENTS.VOICE_NOTE,
  EVENTS.DOCUMENT
]).addAction(async (ctx: any, { provider }) => {
  const telefono = ctx.from

  try {
    // 1. Descarga el archivo físicamente en la carpeta uploads y retorna los datos
    const media = await procesarMedia(ctx, provider)
    if (!media || !media.fileName) return

    // 2. Homologar el tipo de mensaje acorde con el enum/estándar del Panel de Usuario
    let tipoMensajeEstandar = 'USUARIO_IMAGEN'
    if (ctx.type === EVENTS.VOICE_NOTE || media.tipoMensaje === 'AUDIO') {
      tipoMensajeEstandar = 'USUARIO_AUDIO'
    } else if (ctx.type === EVENTS.DOCUMENT || media.tipoMensaje === 'DOCUMENTO') {
      tipoMensajeEstandar = 'USUARIO_DOCUMENTO'
    }

    const leyendaTexto = ctx.body && ctx.body.trim() !== ''
      ? ctx.body
      : (tipoMensajeEstandar === 'USUARIO_AUDIO' ? 'Nota de voz' : 'Archivo adjunto')

    // 3. Envío estandarizado a Express (se guarda sin emitir respuestas al usuario)
    await fetch(`${API_BASE_URL}/messages/guardar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify({
        telefono,
        mensaje: leyendaTexto,
        emisor: 'USUARIO',
        url_media: media.fileName, // Solo el nombre del archivo en /uploads
        tipo_mensaje: tipoMensajeEstandar
      })
    })

    console.log(`📸 Multimedia guardado para [${telefono}]: ${media.fileName}`)
  } catch (error) {
    console.error('❌ Error al procesar multimedia en BuilderBot:', error)
  }
  // Al no tener .addAnswer(), el flujo termina silenciosamente sin interrumpir al usuario o asesor
})