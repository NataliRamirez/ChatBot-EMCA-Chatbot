import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { fugaAguaFlow } from '../AcueductoAlcantarillado/fugaAgua.js';
import { sinServicioAguaFlow } from '../AcueductoAlcantarillado/sinServicioAguaFlow.js';
import { alcantarilladoTapadoFlow } from '../AcueductoAlcantarillado/alcantarilladoTapadoFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeAcueducto = '💧 *REPORTE DE ACUEDUCTO Y ALCANTARILLADO*\n\nPor favor, selecciona una de las siguientes opciones:';
const botones = ['Alcantarillado', 'Fuga de agua', 'Sin servicio'];

export const AcueductoAlcantarilladoFlow = addKeyword(['Acueducto', 'Alcantarillado', 'Acueducto y alcantarillado'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();

    await guardarMensaje(
      telefono,
      mensajeAcueducto,
      'BOT',
      botones,
      null,
      'BOT_TEXTO'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeAcueducto,
    {
      buttons: [
        { body: 'Alcantarillado' },
        { body: 'Fuga de agua' },
        { body: 'Sin servicio' }
      ],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
      const telefono = ctx.from;
      const bodyText = String(ctx.body || '').trim();

      if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
        return endFlow();
      }

      // Normalización obligatoria: minúsculas y sin acentos
      const opcion = obtenerTextoLimpio(bodyText)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // Evaluación amplia por palabra clave
      if (opcion.includes('fuga')) {
        return gotoFlow(fugaAguaFlow);
      }

      if (opcion.includes('servicio') || opcion.includes('corte')) {
        return gotoFlow(sinServicioAguaFlow);
      }

      if (opcion.includes('alcantarill') || opcion.includes('tapad')) {
        return gotoFlow(alcantarilladoTapadoFlow);
      }

      const msgError = '⚠️ Selecciona una opción válida usando los botones del menú.';
      return fallBack(msgError);
    }
  );