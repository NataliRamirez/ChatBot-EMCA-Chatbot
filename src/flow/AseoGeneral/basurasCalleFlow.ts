import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";
import { usuariosPausados } from "../../app.js";

const mensajeBasuraCalle = 'REPORTAR BASURA EN LA CALLE Hemos registrado tu solicitud sobre la acumulación o recolección de residuos. Para coordinar la atención con la cuadrilla de aseo, te invitamos a compartir la ubicación o fotos del sector a nuestras líneas directas: Líneas de Atención y Reportes: 302 409 1910';
const botones = ['Menú principal'];

// Se agregan palabras clave explícitas
export const basuraCalleFlow = addKeyword(['basura_calle_action', 'basura en la calle', 'reportar basura'])
  
.addAction(async (ctx: any) =>{

  await guardarMensaje(
     ctx.from,
     mensajeBasuraCalle,
     'BOT',
     botones
  )
})

.addAnswer(
    mensajeBasuraCalle,
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