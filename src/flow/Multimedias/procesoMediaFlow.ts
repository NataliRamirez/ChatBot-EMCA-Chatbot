export const procesarMedia = async (ctx: any, mediaUrl) => {

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