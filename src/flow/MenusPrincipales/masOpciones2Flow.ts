import { addKeyword } from '@builderbot/bot';
import { guardarMensaje } from '../conexionApi.js';
import { medidoresFlow } from '../medidoresFlow.js';
import { masOpciones3Flow } from '../MenusPrincipales/masOpciones3Flow.js';
import { usuariosPausados } from '../../app.js';
import { HorariosBasuraFlow } from '../AseoGeneral/HorariosBasuraFlow.js';

// Mensajes y botones locales
const mensajeMasOpciones2 = '⏱️ *RECOLECCIÓN Y MEDIDORES*\n──────────────────────────────────\n🔹 *Página 2 de 3*\n\n📌 *¿Qué servicio necesitas verificar?*\n• Consulta de días y horarios de recolección de basura.\n• Novedades, lecturas y reportes sobre medidores.\n\n👇 *Toca un botón para elegir:*';
const botonesMasOpciones2 = ['Horarios Basura', 'Medidores', 'Siguiente'];

// Mensajes de los flujos destino para precarga en el panel
const mensajeHorariosBasura = '🗑️ *HORARIOS DE RECOLECCIÓN DE BASURAS*\n\nPara consultar las rutas y los horarios de recolección de aseo y residuos en tu sector, comunícate con nuestras líneas directas 3024091910 o 3024091899.\n\nPresiona el botón de abajo para regresar:';
const botonesBasura = ['Menú principal'];

export const masOpciones2Flow = addKeyword(['Siguiente', 'siguiente 1'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();

    // Registra el menú de la Página 2 en el panel web
    await guardarMensaje(
      telefono, 
      mensajeMasOpciones2, 
      'BOT', 
      botonesMasOpciones2, 
      null, 
      'BOT_BOTONES'
    ).catch(() => {});
  })
  .addAnswer(
    mensajeMasOpciones2,
    {
      buttons: [
        { body: 'Horarios Basura' },
        { body: 'Medidores' },
        { body: 'Siguiente' }
      ],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
      const telefono = ctx.from;
      const rawText = String(ctx.body || '').trim();

      if (usuariosPausados.has(telefono) || rawText.startsWith('_event_')) {
        return endFlow();
      }

      const textoLimpio = rawText
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/gi, '')
        .trim();

      // Opción 1: Horarios de Basura
      if (textoLimpio.includes('horario basura') || textoLimpio.includes('basura') || textoLimpio.includes('bas')) {
        await guardarMensaje(
          telefono,
          mensajeHorariosBasura,
          'BOT',
          botonesBasura,
          null,
          'BOT_BOTONES'
        ).catch(() => {});

        return gotoFlow(HorariosBasuraFlow);
      }

      // Opción 2: Medidores
      if (textoLimpio.includes('medidor')) {
        return gotoFlow(medidoresFlow);
      }

      // Opción 3: Siguiente (Página 3)
      if (textoLimpio.includes('siguiente')) {
        return gotoFlow(masOpciones3Flow);
      }

      return fallBack('⚠️ Selecciona una opción válida del menú.');
    }
  );