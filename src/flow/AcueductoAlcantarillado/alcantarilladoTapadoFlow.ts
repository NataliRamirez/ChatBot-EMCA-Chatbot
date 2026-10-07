import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from '../../app.js';

const mensajeAlcantarilla = 'REPORTAR ALCANTARILLADO TAPADO .Hemos recibido tu solicitud. Para programar la revisión técnica de manera rápida, te invitamos a enviar una fotografía o video del daño a nuestra línea directa de atención: WhatsApp de Soporte: 302 409 1910 Haz clic en el botón de abajo si deseas regresar al menú principal:';
const botones = ['Menú principal']


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