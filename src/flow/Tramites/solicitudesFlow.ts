import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from "../../app.js";

const botones = ['Menú principal']
const mensajeSolicitudes = `Para mas información y poder gestionar su solicitud le invitamos a ingresar en nuestra página (Tramites , solicitudes, pqr , derechos de petición):
https://www.emca-calarca-quindio.gov.co/peticiones-quejas-reclamos

Tenga en cuenta que cada petición tiene una duración de respuesta de 15 días hábiles después de la solicitud.`


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