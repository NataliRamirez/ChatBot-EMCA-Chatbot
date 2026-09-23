import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'
import { usuariosPausados } from '../../app.js'

/**
 * @file certificadosFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de suministrar información relacionada con
 * la solicitud de certificados ofrecidos por EMCA. Permite consultar los
 * tipos de certificados disponibles, los canales de atención y retornar
 * posteriormente al menú principal del chatbot.
 */

const mensajeCertificado = `📄 *CERTIFICADOS*\n\nPara solicitar certificados de:\n• Paz y salvo\n• Estratificación\n• Servicios públicos\n• Otros certificados relacionados\n\nLe invitamos a acercarse a nuestra oficina principal o comunicarse con nuestras líneas de atención.\n\n📍 *Dirección:* Carrera 24 #39-54, Calarcá - Quindío\n⏰ *Horario de atención:* Lunes a viernes de 7:30 a.m. a 12:00 m y de 2:00 p.m. a 5:00 p.m.`
const botones = ['Menú principal']

export const certificadosFlow = addKeyword(['📄 Certificados', 'certificados'])
  
.addAction(async (ctx: any) => {
  
    await guardarMensaje(
      ctx.from, 
      mensajeCertificado, 
      'BOT', 
      botones
    )

  })
  .addAnswer(
    mensajeCertificado,
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