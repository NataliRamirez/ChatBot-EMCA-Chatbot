import fs from 'fs'
import path from 'path'

/**
 * @file media.services.ts
 * @author Juan David Nieto
 * @description Utilidad encargada de la preparación y clasificación de archivos
 * multimedia enviados por los usuarios a través de WhatsApp. Este módulo crea
 * automáticamente la estructura de carpetas temporales necesarias para almacenar
 * imágenes, videos, audios y documentos, además de identificar el tipo de
 * contenido recibido para su posterior procesamiento.
 */

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