import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeHorariosBasura = '🗑️ *HORARIOS DE RECOLECCIÓN DE BASURAS*\n\nPara consultar las rutas y los horarios de recolección de aseo y residuos en tu sector, comunícate con nuestras líneas directas 3024091910 o 3024091899.\n\nPresiona el botón de abajo para regresar:';
const botonesBasura = ['Menú principal'];

export const HorariosBasuraFlow = addKeyword(['Horarios basura', 'horarios basura'])
  // 1. .addAction() ejecuta guardarMensaje al entrar por keyword directa
  .addAction(async (ctx: any) => {
    await guardarMensaje(
      ctx.from,
      mensajeHorariosBasura,
      'BOT',
      botonesBasura,
      null,
      'BOT_BOTONES'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeHorariosBasura,
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

      return fallBack('⚠️ Por favor, presiona el botón para regresar.');
    }
  );