import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { MatriculaFlow } from "../Asesor/MatriculaFlow.js";
import { usuariosPausados } from "../../app.js";

const mensajeComercial = '🏢 *ÁREA COMERCIAL*\n\nSelecciona la opción que requieres:';
const botonesComercial = ['Matrícula', 'Menú principal'];

export const comercialFlow = addKeyword(['comercial', 'Comercial', 'Area comercial'])
  .addAction(async (ctx: any) => {
    await guardarMensaje(
      ctx.from,
      mensajeComercial,
      'BOT',
      botonesComercial,
      null,
      'BOT_BOTONES'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeComercial,
    {
      buttons: [
        { body: 'Matrícula' },
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

      const opcion = obtenerTextoLimpio(bodyText).toLowerCase();

      if (opcion.includes('matricula') || opcion.includes('nueva')) {
        return gotoFlow(MatriculaFlow);
      }

      if (opcion.includes('menu') || opcion.includes('principal')) {
        return gotoFlow(menuPrincipalFlow);
      }

      return fallBack('⚠️ Selecciona una opción válida usando los botones.');
    }
  );