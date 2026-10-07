import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { masOpcionesFlow } from '../MenusPrincipales/masOpcionesFlow.js'
import { usuariosPausados } from '../../app.js'



const mensajeTramites = `TRÁMITES, PQRS Y DERECHOS DE PETICIÓN

Para radicar o hacer seguimiento a tus solicitudes formales, te invitamos a ingresar a nuestra sede electrónica:
https://www.emca-calarca-quindio.gov.co/peticiones-quejas-reclamos

A través de nuestro portal puedes gestionar:

Peticiones y Solicitudes

Quejas y Reclamos

Derechos de Petición

Tiempo de respuesta: De acuerdo con la normativa, cada solicitud formal cuenta con un plazo de atención de hasta 15 días hábiles a partir de su radicación.

Presiona el botón para regresar al menú principal:`

/**
 * @file tramitesFlow.ts
 * @author Juan David Nieto
 * @description Flujo informativo encargado de orientar a los usuarios sobre
 * los trámites, solicitudes, peticiones, quejas, reclamos y derechos de
 * petición disponibles a través del portal oficial de EMCA. Permite además
 * regresar al menú de opciones comerciales una vez finalizada la consulta.
 */


const botones = ['Más opciones']

export const tramitesFlow = addKeyword(['📝 Trámites y solicitudes', '📝 Trámites'])

  .addAction(async (ctx:any)=>{
     await guardarMensaje(
      ctx.from,
      mensajeTramites,
      'BOT',
      botones
     )
  })
  
  .addAnswer(
    mensajeTramites,
    {
      buttons: [
        { body: 'Más opciones' }
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