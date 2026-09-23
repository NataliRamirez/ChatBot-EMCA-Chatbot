import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from './conexionApi.js'
import { masOpcionesFlow } from './MenusPrincipales/masOpcionesFlow.js'
import { usuariosPausados } from '../app.js'

const mensajeMedidor = `📟 *MEDIDORES*\n\nPara realizar trámites relacionados con:\n• Revisión de medidor\n• Cambio de medidor\n• Medidor dañado\n• Medidor detenido\n• Verificación de lectura\n\nDebe acercarse a nuestra oficina principal.\n\n📍 *Dirección:* Carrera 24 #39-54, Calarcá - Quindío\n🕒 *Horario de atención:* Lunes a viernes de 7:30 a.m. a 12:00 m y de 2:00 p.m. a 5:00 p.m. o comunicarse a los siguientes numeros 3024091910 o el 3024091899 y hacer el reporte del medidor ya sea que adquiera el servicio con EMCA ESP o propio del usuario `
const botones = ['Menú principal']

export const medidoresFlow = addKeyword(['Medidores', 'medidores', 'medidor'])
  .addAction(async (ctx: any) => {

    await guardarMensaje(
      ctx.from, 
      mensajeMedidor, 
      'BOT', 
      botones
    )

  })
  .addAnswer(
    mensajeMedidor,
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
                 return gotoFlow(masOpcionesFlow);
               }
         
               const msgError = '⚠️ Por favor, presiona el botón para regresar.';
              
               return fallBack(msgError);
       }
  )