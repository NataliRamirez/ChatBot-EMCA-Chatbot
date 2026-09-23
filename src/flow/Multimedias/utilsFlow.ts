import { addKeyword, utils } from '@builderbot/bot'
import { MetaProvider as Provider } from '@builderbot/provider-meta'
import { MemoryDB as Database } from '@builderbot/bot'
import { join } from 'path'

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