import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'
import { usuariosPausados } from '../../app.js'

/**
 * @file predioDesocupadoFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de suministrar información relacionada con
 * trámites de predios, cambios de propietario y traspasos de vivienda.
 * Permite orientar al usuario sobre los requisitos documentales, el
 * procedimiento presencial y los canales de atención habilitados por EMCA.
 */

const mensajePredio = `💧 *PREDIO / TRASPASO DE VIVIENDA*\n\nPara vender o realizar el traspaso de una vivienda debe presentarse personalmente en nuestras oficinas.\n\n📋 Documentos requeridos:\n1️⃣ Tener presente la dirección exacta del inmueble.\n2️⃣ Documento de identidad.\n3️⃣ Ser propietario del inmueble.\n4️⃣ Cada tres meses renovar despues de sacar.\n5️⃣ Fotocopia de la cédula.\n6️⃣ anexar recibo de laluz y atender la visita posterior mente a los 15 días habiles .\n por ultimo dirigirse directamenta a nuestras oficinas en los 🕒 *Horario de atención:* Lunes a viernes de 7:30 a.m. a 5:30 p.m.\n📍 *Dirección:* Carrera 24 #39-54`
const botones = ['Menú principal']

export const predioDesocupadoFlow = addKeyword(['💧 Predio', 'predio'])
 
.addAction(async (ctx: any) => {
    
  await guardarMensaje(
         ctx.from,
         mensajePredio,
         'BOT',
         botones
        )
  })
  .addAnswer(
    mensajePredio,
    {
      buttons: [{ body: 'Menú principal' }],
      capture: true
    },
      async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
          const telefono = ctx.from;
          const bodyText = String(ctx.body || '').trim();
    
          if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
            return endFlow();
          }
    
          const opcion = obtenerTextoLimpio(bodyText)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    
    
          if (opcion.includes('menu') || opcion.includes('princip')) {
            return gotoFlow(menuPrincipalFlow);
          }
    
          const msgError = '⚠️ Por favor, presiona el botón para regresar.';
          return fallBack(msgError);
        }
  )