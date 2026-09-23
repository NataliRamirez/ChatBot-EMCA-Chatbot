import { addKeyword, utils } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { MemoryDB as Database } from '@builderbot/bot'
import { join } from 'path'


/**
 * @file fullSamplesFlow.ts
 * @author Juan David Nieto
 * @description Flujo de demostración encargado de enviar ejemplos de
 * archivos multimedia al usuario. Su propósito es validar el correcto
 * funcionamiento del proveedor de WhatsApp, la gestión de archivos
 * locales y la visualización de contenido multimedia dentro del chatbot.
 */
export const fullSamplesFlow = addKeyword<Provider, Database>([
  'samples',
  utils.setEvent('SAMPLES')
])

.addAnswer('📷 Imagen local', {
  media: join(process.cwd(), 'uploads/sample.png')
})

.addAnswer('🎧 Audio local', {
  media: join(process.cwd(), 'uploads/sample.mp3')
})

.addAnswer('🎥 Video local', {
  media: join(process.cwd(), 'uploads/sample.mp4')
})

.addAnswer('📄 Documento local', {
  media: join(process.cwd(), 'uploads/sample.pdf')
})