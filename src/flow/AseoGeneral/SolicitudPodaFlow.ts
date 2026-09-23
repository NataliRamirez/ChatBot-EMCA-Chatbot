import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from "../../app.js";

const mensajeSolicitudPoda = '🌳 *SOLICITUD DE PODA DE ÁRBOLES Y ZONAS VERDES*\n\nHemos registrado tu reporte de falla en el alumbrado público. Por eso lo invitamos a realizar el reporte al siguiente numero telefonico 3024091910 o el 3024091899 y nuestro equipo técnico procederá a verificar el sector.\n\nPresiona el botón para regresar:';
const botones = ['Menú principal'];

// Se agregan palabras clave explícitas
export const SolicitudPodaFlow = addKeyword(['solicitud_poda_action', 'poda de arboles', 'solicitud de poda'])
  
.addAction(async (ctx: any) =>{

  await guardarMensaje(
    ctx.from,
    mensajeSolicitudPoda,
    'BOT',
    botones
  )
})

.addAnswer(
    mensajeSolicitudPoda,
    {
      buttons: [{ body: 'Menú principal' }],
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