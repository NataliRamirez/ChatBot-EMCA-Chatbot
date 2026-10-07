import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'

const mensajeLineas = `📞 *LÍNEAS DE ATENCIÓN*\n\nEsperamos que tenga un excelente día. Por favor indíquenos cuál es su caso y sea muy específico en el reporte del daño.\n\n📱 Atención WhatsApp: +57 302 409 1910\n☎️ Línea fija: (606) 735 0000\n🕒 Horario de atención: Lunes a Viernes de 7:30 a.m. a 5:30 p.m.`
const botones = ['Menú principal']

export const lineasFlow = addKeyword(['📞 Líneas', 'lineas'])
  .addAction(async (ctx: any) => {
    await guardarMensaje(ctx.from, mensajeLineas, 'BOT', botones)
  })
  .addAnswer(
    mensajeLineas,
    {
      buttons: [{ body: 'Menú principal' }],
      capture: true
    },
    async (ctx: any, { gotoFlow }) => {
      const telefono = ctx.from
      const respuestaUsuario = obtenerTextoLimpio(ctx)

      await guardarMensaje(telefono, respuestaUsuario, 'USUARIO')
      return gotoFlow(menuPrincipalFlow)
    }
  )