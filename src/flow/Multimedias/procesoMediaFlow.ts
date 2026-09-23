export const procesarMedia = async (ctx: any, mediaUrl) => {

/**
 * @function procesarMedia
 * @author Juan David Nieto
 * @description Función encargada de identificar el tipo de archivo multimedia
 * recibido desde WhatsApp y normalizar su estructura para ser almacenada
 * posteriormente en la base de datos y visualizada desde el panel administrativo.
 */

  const msg = ctx.media

  if (msg?.imageMessage){ 
    return {
      tipo: 'USUARIO_IMAGEN',
      url: mediaUrl
    }
  }

  if (msg?.videoMessage) {
    return {
      tipo: 'USUARIO_VIDEO',
      url: mediaUrl
    }
  }

  if (msg?.audioMessage) {
    return {
      tipo: 'USUARIO_AUDIO',
      url: mediaUrl
    }
  }

  if (msg?.documentMessage) {
    return {
      tipo: 'USUARIO_DOCUMENTO',
      url: mediaUrl
    }
  }

  return {
    tipo: 'USUARIO_MEDIA',
    url: mediaUrl
  }
}