import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { alumbradoFlow } from '../Alumbrado/AlumbradoFlow.js';
import { AcueductoAlcantarilladoFlow } from '../Reportes/AcueductoAlcantarilladoFlow.js';
import { aseoFlow } from '../Reportes/Aseoflow.js';
import { usuariosPausados } from '../../app.js';

/**
 * @file reportesFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de la gestión inicial de reportes de servicios
 * públicos dentro del chatbot EMCA. Permite al usuario seleccionar el área
 * correspondiente para registrar novedades relacionadas con alumbrado público,
 * acueducto, alcantarillado y aseo.
 */

const mensajeReportes = '⚠️ *REPORTES DE SERVICIOS*───────────────────────────────Bienvenido al canal de novedades técnicas. Registra tu reporte de forma rápida y sin esperas. 👇 *Toca un botón según tu servicio:*';
const botonesReportes = ['Alumbrado', 'Acueducto', 'Aseo'];

export const reportesFlow = addKeyword(['🚨 Reportes', 'reportes'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();

    guardarMensaje(
      telefono, 
      mensajeReportes, 
      'BOT', 
      botonesReportes, 
      null, 
      'BOT_TEXTO'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeReportes,
    {
      buttons: [
        { body: 'Alumbrado' },
        { body: 'Acueducto' },
        { body: 'Aseo' }
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

      // 1. Evaluación directa para Aseo
      if (opcion.includes('aseo')) {
        return gotoFlow(aseoFlow);
      }

      // 2. Evaluación para Alumbrado
      if (opcion.includes('alumbrado') || opcion.includes('luz')) {
        return gotoFlow(alumbradoFlow);
      }

      // 3. Evaluación para Acueducto
      if (opcion.includes('acueducto') || opcion.includes('agua') || opcion.includes('alcantarillado')) {
        return gotoFlow(AcueductoAlcantarilladoFlow);
      }

      const msgError = '⚠️ Selecciona una opción válida usando los botones del menú.';
      return fallBack(msgError);
    }
  );