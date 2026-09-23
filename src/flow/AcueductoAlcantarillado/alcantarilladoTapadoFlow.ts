import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from '../../app.js';

const mensajeAlcantarilla = '🗜 *REPORTAR ALCANTARILLADO TAPADO*\n\nHemos resivido su solicitud por lo tanto lo invitamos a realizar su reporte con una imagen o video en el siguiente numero 3024091910 o el 3024091899\n\nPresiona el botón para regresar al menú principal:';
const botones = ['Menú principal']

/**
 * @file alcantarilladoTapadoFlow.ts
 * @author Juan David Nieto
 * @description Flujo conversacional encargado de atender los reportes
 * relacionados con alcantarillados tapados. El sistema informa al usuario
 * los canales oficiales donde puede enviar evidencias fotográficas o videos
 * para la gestión de la solicitud y permite retornar al menú principal.
 */

export const alcantarilladoTapadoFlow = addKeyword(['alcantarillado_tapado_action', 'alcantarillado tapado', 'alcantarilla tapada'])
  
.addAction( async ( ctx: any) =>{

  await guardarMensaje(
    ctx.from,
    mensajeAlcantarilla,
    'BOT',
    botones
  )
})



.addAnswer(
    mensajeAlcantarilla,
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
  );