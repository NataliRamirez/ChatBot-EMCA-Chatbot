import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from "../../app.js";


const botones = ['Menú principal']
const mensajeSolicitudes = `MÁS INFORMACIÓN Y GESTIÓN DE SOLICITUDES

Para consultar más información o realizar un trámite formal, te invitamos a ingresar a nuestro portal web oficial (Trámites, Solicitudes, PQR y Derechos de Petición):

https://www.emca-calarca-quindio.gov.co/peticiones-quejas-reclamos

Tener en cuenta: Cada petición formal tiene un tiempo de respuesta de hasta 15 días hábiles a partir de la fecha de radicación.

Haz clic en el botón de abajo para regresar:`

/**
 * @file SolicitudesFlow.ts
 * @author Juan David Nieto
 * @description Flujo informativo encargado de brindar al usuario el enlace
 * oficial para la gestión de solicitudes, peticiones, quejas, reclamos
 * y derechos de petición de EMCA. Permite redirigir al menú principal
 * una vez finalizada la consulta.
 */




export const SolicitudesFlow = addKeyword(['Solicitudes'])
  
  .addAction(async (ctx:any) =>{
   
    guardarMensaje(
      ctx.from,
      ctx.body,
      'USUARIO'
    )
  })

  .addAnswer(
    mensajeSolicitudes,
    {
      buttons: [
        { body: 'Menú principal' }
      ],
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