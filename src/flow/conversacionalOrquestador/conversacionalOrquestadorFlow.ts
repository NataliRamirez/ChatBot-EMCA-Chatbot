import { addKeyword, EVENTS } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { usuariosPausados } from '../../app.js';

/**
 * @file conversacionalOrquestadorFlow.ts
 * @author Juan David Nieto
 * @description Flujo principal encargado de la atención conversacional del
 * chatbot EMCA, permitiendo identificar la intención del usuario y dirigirlo
 * automáticamente al módulo o servicio correspondiente según su consulta.
 */

// Flujos de submenús importados para delegación
import { alumbradoFlow } from '../Alumbrado/AlumbradoFlow.js';
import { comercialFlow } from '../Alumbrado/comercialFlow.js';
import { LuminariaEncendidaFlow } from '../Alumbrado/LuminariaEncendida.js';
import { LuminariaApagadaFlow } from '../Alumbrado/LuminariaApagada.js';

import { AcueductoAlcantarilladoFlow } from '../Reportes/AcueductoAlcantarilladoFlow.js';
import { alcantarilladoTapadoFlow } from '../AcueductoAlcantarillado/alcantarilladoTapadoFlow.js';
import { fugaAguaFlow } from '../AcueductoAlcantarillado/fugaAgua.js';
import { sinServicioAguaFlow } from '../AcueductoAlcantarillado/sinServicioAguaFlow.js';

import { aseoFlow } from '../Reportes/Aseoflow.js';
import { basuraCalleFlow } from '../AseoGeneral/basurasCalleFlow.js';
import { SolicitudPodaFlow } from '../AseoGeneral/SolicitudPodaFlow.js';
import { recolecionEspecialesFlow } from '../AseoGeneral/recolecionEspecialesFlow.js';

import { horariosFlow } from '../Horarios/horariosFlow.js';
import { lineasFlow } from '../Horarios/LineasFlow.js';

import { tramitesFlow } from '../Tramites/tramitesFlow.js';
import { dobleFacturacionFlow } from '../Tramites/dobleFacturacion.js';
import { predioDesocupadoFlow } from '../Tramites/predioDesocupadoFlow.js';
import { certificadosFlow } from '../Tramites/certificadosFlow.js';
import { medidoresFlow } from '../medidoresFlow.js';
import { MatriculaFlow } from '../Asesor/MatriculaFlow.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';

export const conversacionalOrquestadorFlow = addKeyword([EVENTS.WELCOME, 'hola', 'buenas', 'inicio', 'menu', 'ayuda'])
  .addAction(async (ctx: any, { endFlow }) => {
    const telefono = ctx.from;
    if (usuariosPausados.has(telefono)) return endFlow();
  })
  .addAnswer(
    '👋 ¡Hola! Un gusto saludarte. Soy el asistente virtual de EMCA.\n\n¿En qué te puedo colaborar hoy? Puedes escribirme directamente lo que necesitas o seleccionar *Ver opciones*.',
    {
      buttons: [{ body: '📋 Ver opciones' }],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack, state, flowDynamic, endFlow }) => {
      const telefono = ctx.from;
      const bodyText = String(ctx.body || '').trim();

      if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
        return endFlow();
      }

      // Normalizar texto para la búsqueda
      const texto = obtenerTextoLimpio(bodyText)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      

      // ==========================================
      // 1. ÁREA DE ALUMBRADO PÚBLICO
      // ==========================================
      if (texto.includes('encendida') || texto.includes('prendida dia')) {
        await flowDynamic('💡 Entendido, vamos a registrar la luminaria encendida de día.');
        return gotoFlow(LuminariaEncendidaFlow);
      }
      if (texto.includes('apagada') || texto.includes('sin luz calle') || texto.includes('oscura')) {
        await flowDynamic('💡 De acuerdo, pasaremos el reporte de la luminaria apagada.');
        return gotoFlow(LuminariaApagadaFlow);
      }
      if (texto.includes('matricula') || texto.includes('comercial') || texto.includes('asesor')) {
        await flowDynamic('🏬 Te transfiero con un asesor del área comercial para la gestión de tu matrícula.');
        return gotoFlow(MatriculaFlow);
      }
      if (texto.includes('alumbrado') || texto.includes('lampara')) {
        return gotoFlow(alumbradoFlow);
      }

      // ==========================================
      // 2. ÁREA DE ACUEDUCTO Y ALCANTARILLADO
      // ==========================================
      if (texto.includes('fuga') || texto.includes('bote agua') || texto.includes('tubo roto')) {
        await flowDynamic('💧 Con gusto. Vamos a registrar la fuga de agua inmediatamente.');
        return gotoFlow(fugaAguaFlow);
      }
      if (texto.includes('tapado') || texto.includes('alcantarilla') || texto.includes('reja')) {
        await flowDynamic('💧 Entendido, reporte de alcantarillado tapado.');
        return gotoFlow(alcantarilladoTapadoFlow);
      }
      if (texto.includes('sin servicio') || texto.includes('corte agua') || texto.includes('no hay agua')) {
        await flowDynamic('💧 Revisemos el estado de tu servicio de agua.');
        return gotoFlow(sinServicioAguaFlow);
      }
      if (texto.includes('acueducto')) {
        return gotoFlow(AcueductoAlcantarilladoFlow);
      }

      // ==========================================
      // 3. ÁREA DE ASEO GENERAL Y RECOLECCIÓN
      // ==========================================
      if (texto.includes('basura calle') || texto.includes('acumulacion') || texto.includes('reguero')) {
        await flowDynamic('🗑 Registraremos el reporte de basuras en la calle.');
        return gotoFlow(basuraCalleFlow);
      }
      if (texto.includes('poda') || texto.includes('arbol') || texto.includes('rama')) {
        await flowDynamic('🌳 Vamos a tramitar tu solicitud de poda.');
        return gotoFlow(SolicitudPodaFlow);
      }
      if (texto.includes('especial') || texto.includes('escombro') || texto.includes('colchon') || texto.includes('mueble')) {
        await flowDynamic('🚛 Registraremos tu recolección de residuos especiales.');
        return gotoFlow(recolecionEspecialesFlow);
      }
      if (texto.includes('aseo')) {
        return gotoFlow(aseoFlow);
      }

      // ==========================================
      // 4. TRÁMITES, FACTURACIÓN Y CERTIFICADOS
      // ==========================================
      if (texto.includes('doble factura') || texto.includes('cobro doble') || texto.includes('facturacion')) {
        await flowDynamic('📄 Revisemos el caso de doble facturación.');
        return gotoFlow(dobleFacturacionFlow);
      }
      if (texto.includes('predio') || texto.includes('desocupado')) {
        await flowDynamic('🏠 Iniciemos el trámite para predio desocupado.');
        return gotoFlow(predioDesocupadoFlow);
      }
      if (texto.includes('certificado') || texto.includes('paz y salvo')) {
        await flowDynamic('📜 Generemos tu solicitud de certificados.');
        return gotoFlow(certificadosFlow);
      }
      if (texto.includes('medidor') || texto.includes('contador')) {
        await flowDynamic('⏱ Revisemos la información sobre medidores.');
        return gotoFlow(medidoresFlow);
      }
      if (texto.includes('tramite')) {
        return gotoFlow(tramitesFlow);
      }

      // ==========================================
      // 5. HORARIOS Y LÍNEAS
      // ==========================================
      if (texto.includes('horario') || texto.includes('atencion') || texto.includes('abierto')) {
        await flowDynamic('🕐 Aquí tienes la información sobre los horarios de atención y rutas de basura.');
        return gotoFlow(horariosFlow);
      }

      // ==========================================
      // 6. SOLICITUD DE MENÚ ESTRUCTURADO (EXPLICITO)
      // ==========================================
      if (texto.includes('opciones') || texto.includes('menu') || texto.includes('ver menu')) {
        return gotoFlow(menuPrincipalFlow);
      }

      // Fallback conversacional si no se identifica la intención exacta
      const respuestaFallback = 'No logré identificar tu consulta exacta. 😊\n\n¿Te refieres a un *reporte* (fuga, luminaria, basuras), un *trámite* (predio, certificados, doble factura) o deseas consultar *horarios*?';
      await guardarMensaje(telefono, respuestaFallback, 'BOT').catch(() => {});
      return fallBack(respuestaFallback);
    }
  );