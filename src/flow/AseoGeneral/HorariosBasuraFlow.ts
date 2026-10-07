import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeHorariosBasura = 'HORARIOS DE RECOLECCIÓN DE BASURA Para consultar el día, las rutas y los horarios exactos de recolección de residuos en tu sector, comunícate con nuestras líneas de atención directa: Líneas de Atención e Información: 302 409 1910 o 302 409 1899';
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