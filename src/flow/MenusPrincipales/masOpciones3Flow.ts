import { addKeyword } from '@builderbot/bot'
import { guardarMensaje } from '../conexionApi.js'
import { predioDesocupadoFlow } from '../Tramites/predioDesocupadoFlow.js'
import { certificadosFlow } from '../Tramites/certificadosFlow.js'
import { asesorFlow } from '../Asesor/asesorFlow.js' // 👈 Importamos asesorFlow
import { usuariosPausados } from '../../app.js'

/**
 * @file masOpciones3Flow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de mostrar la tercera página del menú de
 * opciones del chatbot EMCA, permitiendo al usuario gestionar consultas
 * relacionadas con certificados, predios y atención personalizada mediante asesor.
 */

const mensajeMasOpciones3 = '📜 *CERTIFICACIONES Y PREDIO*\n──────────────────────────────────\n🔹 *Página 3 de 3*\n📌 *Gestión documental en línea:*\n• Expedición de certificados de paz y salvo / servicio.\n• Actualización o consulta de datos del predio.\n\n👇 *Toca un botón para elegir:*'

// 👈 Cambiamos "Menú principal" por "Asesor"
const botones = ['Predio', 'Certificados', 'Asesor']

export const masOpciones3Flow = addKeyword(['Siguiente 2', 'siguiente 2'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from
    if (usuariosPausados.has(telefono)) return endFlow()

    // Guardamos el mensaje en MySQL con tipo 'BOT_BOTONES'
    await guardarMensaje(telefono, mensajeMasOpciones3, 'BOT', botones, null, 'BOT_BOTONES')
  })
  .addAnswer(
    mensajeMasOpciones3,
    {
      buttons: [
        { body: 'Predio' },
        { body: 'Certificados' },
        { body: 'Asesor' } // 👈 Botón modificado
      ],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
      const telefono = ctx.from
      const rawText = String(ctx.body || '').trim()

      if (usuariosPausados.has(telefono) || rawText.startsWith('_event_')) {
        return endFlow()
      }

      const textoLimpio = rawText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      if (textoLimpio.includes('predio')) return gotoFlow(predioDesocupadoFlow)
      if (textoLimpio.includes('certificado')) return gotoFlow(certificadosFlow)
      
      // 👈 Dirigimos el flujo hacia asesorFlow al presionar "Asesor"
      if (textoLimpio.includes('asesor')) return gotoFlow(asesorFlow)

      const msgError = '⚠️ Selecciona una opción válida del menú.'
      return fallBack(msgError)
    }
  )