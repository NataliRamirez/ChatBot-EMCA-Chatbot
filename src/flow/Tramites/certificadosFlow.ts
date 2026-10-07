import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'
import { usuariosPausados } from '../../app.js'


const mensajeCertificado = `SOLICITUD DE CERTIFICADOS

Puedes tramitar las siguientes certificaciones:
• Paz y Salvo
• Estratificación
• Prestación de Servicios Públicos
• Otros certificados administrativos

Te invitamos a realizar tu trámite de forma presencial o comunicándote a nuestras líneas de atención:

📍 Dirección: Carrera 24 #39-54, Calarcá - Quindío
⏰ Horario de atención: Lunes a viernes de 7:30 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.

Haz clic en el botón de abajo para regresar:`

/**
 * @file certificadosFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de suministrar información relacionada con
 * la solicitud de certificados ofrecidos por EMCA. Permite consultar los
 * tipos de certificados disponibles, los canales de atención y retornar
 * posteriormente al menú principal del chatbot.
 */


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