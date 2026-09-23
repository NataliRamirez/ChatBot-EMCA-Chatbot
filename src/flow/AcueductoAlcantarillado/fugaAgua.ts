import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from '../../app.js';

const mensajeFugaAgua = '💧 *REPORTAR FUGA DE AGUA*\n\nHemos recibido su reporte por eso lo invitamos a realizar su reporte en los siguientes numeros 3024091920 o el 3024091899\n\nPresiona el botón para regresar al menú principal:';
const botones = ['Menú principal']


export const fugaAguaFlow = addKeyword(['fuga_agua_action_event', 'fuga de agua', 'reportar fuga'])
  
.addAction(async (ctx:any) =>{

  await guardarMensaje(
      ctx.from,
      mensajeFugaAgua,
      'BOT',
      botones
  )
})

.addAction(async (ctx: any, { endFlow, state }) => {
    const telefono = ctx.from;
    const bodyText = String(ctx.body || '').trim();


    const currentState = state.getMyState() || {};
    if (currentState.enRegistro) {
      return;
    }

    if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
      return endFlow();
    }

  })
  .addAnswer(
    mensajeFugaAgua,
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

      if (opcion.includes('menu') || opcion.includes('princip') || opcion.includes('volver')) {
        return gotoFlow(menuPrincipalFlow);
      }

      const msgError = '⚠️ Por favor, presiona el botón para regresar al menú principal.';
      return fallBack(msgError);
    }
  );