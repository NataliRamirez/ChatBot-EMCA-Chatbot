import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { comercialFlow } from "./comercialFlow.js";
import { usuariosPausados } from "../../app.js";
import { LuminariaApagadaFlow } from "./LuminariaApagada.js";
import { LuminariaEncendidaFlow } from "./LuminariaEncendida.js";

const mensajeAlumbrado = '💡 *REPORTE DE ALUMBRADO PÚBLICO*\n\nPor favor, selecciona una de las siguientes opciones:';
const botonesAlumbrado = ['Luz Apagada', 'Luz Encendida', 'Comercial'];

/**
 * @file alumbradoFlow.ts
 * @author Juan David Nieto
 * @description Flujo conversacional encargado de gestionar los reportes
 * relacionados con el servicio de alumbrado público. Permite al usuario
 * seleccionar el tipo de incidencia presentada y redirige al flujo
 * correspondiente para su atención.
 */

export const alumbradoFlow = addKeyword(['Alumbrado', 'alumbrado', 'alumbrano', '💡 Alumbrado'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();

    // Guardado sincrónico previo con el tipo correcto BOT_BOTONES
    await guardarMensaje(
      telefono,
      mensajeAlumbrado,
      'BOT',
      botonesAlumbrado,
      null,
      'BOT_BOTONES'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeAlumbrado,
    {
      buttons: [
        { body: 'Luz Apagada' },
        { body: 'Luz Encendida' },
        { body: 'Comercial' }
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

      if (opcion.includes('apagad') || opcion.includes('apa')) {
        return gotoFlow(LuminariaApagadaFlow);
      }

      if (opcion.includes('encendid') || opcion.includes('enc')) {
        return gotoFlow(LuminariaEncendidaFlow);
      }

      if (opcion.includes('comercial') || opcion.includes('area')) {
        return gotoFlow(comercialFlow);
      }

      return fallBack('⚠️ Selecciona una opción válida usando los botones del menú.');
    }
  );