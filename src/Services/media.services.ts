import fs from 'fs'
import path from 'path'

const TEMP_DIR = path.join(process.cwd(), 'src', 'temp')

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

ensureDir(path.join(TEMP_DIR, 'images'))
ensureDir(path.join(TEMP_DIR, 'videos'))
ensureDir(path.join(TEMP_DIR, 'audio'))
ensureDir(path.join(TEMP_DIR, 'docs'))

export const procesarMedia = async (ctx: any) => {

  const mediaUrl = ctx.media

  if (!mediaUrl) return null

  if (ctx.message?.imageMessage) {
    return {
      tipo: 'USUARIO_IMAGEN',
      url: mediaUrl,
      carpeta: 'images'
    }
  }

  if (ctx.message?.videoMessage) {
    return {
      tipo: 'USUARIO_VIDEO',
      url: mediaUrl,
      carpeta: 'videos'
    }
  }

  if (ctx.message?.audioMessage) {
    return {
      tipo: 'USUARIO_AUDIO',
      url: mediaUrl,
      carpeta: 'audio'
    }
  }

  if (ctx.message?.documentMessage) {
    return {
      tipo: 'USUARIO_DOCUMENTO',
      url: mediaUrl,
      carpeta: 'docs'
    }
  }

  return {
    tipo: 'USUARIO_MEDIA',
    url: mediaUrl,
    carpeta: 'docs'
  }
}