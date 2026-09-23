import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { masOpcionesFlow } from '../MenusPrincipales/masOpcionesFlow.js'
import { LuminariaApagadaFlow } from '../Alumbrado/LuminariaApagada.js';
import { LuminariaEncendidaFlow } from '../Alumbrado/LuminariaEncendida.js';
import { usuariosPausados } from '../../app.js';

/**
 * @file alumbradoFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de gestionar los reportes relacionados con
 * el servicio de alumbrado público. Permite al usuario seleccionar el tipo
 * de novedad presentada en una luminaria y redirecciona al flujo
 * correspondiente para registrar el reporte.
 */

const mensajeAlumbrado = `💡 Que reporte desea realizar el día de hoy` /**Por confirmar */
const botonesAlumbrado = ['luminaria Apagada', 'luminaria Encendida', 'Más opciones']

export const alumbradoFlow = addKeyword(['ALUMBRADO_FLOW', 'Alumbrado público', 'alumbrado'])
  
/**Guardado de mensaje del bot y el menu  */
.addAction(async (ctx: any) => {

    await guardarMensaje(
      ctx.from, 
      mensajeAlumbrado, 
      'BOT', 
      botonesAlumbrado
    )

  })


  /**FLUJO DEL BOTON REDIRECIONANDO AL MENU PRINCIPAL 
 * Y CAPTURANDO EL AUTO GUARDADO DEL MENSAJE DEL USUARIO EN EL PANEL USUARIO (EN ESTE CASO EL DEL BOT)
 */


  .addAnswer(
    mensajeAlumbrado,
    {
      buttons: [
        { body: 'luminaria Apagada' },
        { body: 'luminaria Encendida' },
        { body: 'Más opciones'}
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