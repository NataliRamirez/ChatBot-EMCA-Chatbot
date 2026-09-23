import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'
import { usuariosPausados } from '../../app.js'

/**
 * @file horariosFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de proporcionar información sobre los horarios
 * de atención de EMCA, incluyendo dirección y líneas de contacto,
 * permitiendo al usuario regresar al menú principal.
 */

const mensajeHorarios = `📍 *HORARIOS DE ATENCIÓN*\n\nEsperamos que se encuentre muy bien el día de hoy.\n\n🕒 Lunes a Viernes: 7:30 a.m. - 5:30 p.m.\n📍 Dirección: Carrera 24 #39-54\n📞 Teléfono: +57 302 409 1910` /**Por definir  */
const botones = ['Menú principal']

export const horariosFlow = addKeyword(['📍 Horarios', 'horarios'])
  .addAction(async (ctx: any) => {
    await guardarMensaje(ctx.from, mensajeHorarios, 'BOT', botones)
  })
  .addAnswer(

    
    mensajeHorarios,
    {
      buttons: [
        { body: 'Menú principal' }
      ],
      capture: true
    },
    async (ctx:any, {gotoFlow, fallBack, endFlow}) =>{
         const telefono = ctx.from;
         const  bodyText = String(ctx.body || '').trim();
   
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