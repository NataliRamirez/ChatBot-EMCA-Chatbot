import path from 'path';
import fs from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';
import { createBot, createProvider, createFlow, MemoryDB } from '@builderbot/bot';
import { MetaProvider as Provider } from '@builderbot/provider-meta';
import { guardarMensaje } from './flow/conexionApi.js';
import { blackholeFlow } from './flow/Multimedias/blackholFlow.js';

dotenv.config();

const PORT = process.env.PORT ?? 3008;

export const usuariosPausados = new Set<string>();
export const usuariosEnRegistro = new Set<string>();

const limpiarTelefono = (phone: string): string => {
  if (!phone) return '';
  return String(phone).replace(/@c\.us|@s\.whatsapp.net/g, '').replace(/\D/g, '');
};

const main = async () => {
  const { welcomeFlow } = await import('./flow/Flujos/welcomeFlow.js');
  const { conversacionalOrquestadorFlow } = await import('./flow/conversacionalOrquestador/conversacionalOrquestadorFlow.js');
  const { menuPrincipalFlow } = await import('./flow/MenusPrincipales/menuPrincipalFlow.js');
  const { masOpcionesFlow } = await import('./flow/MenusPrincipales/masOpcionesFlow.js');
  const { masOpciones2Flow } = await import('./flow/MenusPrincipales/masOpciones2Flow.js');
  const { masOpciones3Flow } = await import('./flow/MenusPrincipales/masOpciones3Flow.js');

  const { horariosFlow } = await import('./flow/Horarios/horariosFlow.js');
  const { lineasFlow } = await import('./flow/Horarios/LineasFlow.js');
  const { alumbradoFlow } = await import('./flow/Alumbrado/AlumbradoFlow.js');
  const { comercialFlow } = await import('./flow/Alumbrado/comercialFlow.js');
  const { LuminariaEncendidaFlow } = await import('./flow/Alumbrado/LuminariaEncendida.js');
  const { LuminariaApagadaFlow } = await import('./flow/Alumbrado/LuminariaApagada.js');
  const { alcantarilladoTapadoFlow } = await import('./flow/AcueductoAlcantarillado/alcantarilladoTapadoFlow.js');
  const { fugaAguaFlow } = await import('./flow/AcueductoAlcantarillado/fugaAgua.js');
  const { sinServicioAguaFlow } = await import('./flow/AcueductoAlcantarillado/sinServicioAguaFlow.js');
  const { asesorFlow } = await import('./flow/Asesor/asesorFlow.js');
  const { MatriculaFlow } = await import('./flow/Asesor/MatriculaFlow.js');
  const { dobleFacturacionFlow } = await import('./flow/Tramites/dobleFacturacion.js');
  const { basuraCalleFlow } = await import('./flow/AseoGeneral/basurasCalleFlow.js');
  const { recolecionEspecialesFlow } = await import('./flow/AseoGeneral/recolecionEspecialesFlow.js');
  const { SolicitudPodaFlow } = await import('./flow/AseoGeneral/SolicitudPodaFlow.js');
  const { medidoresFlow } = await import('./flow/medidoresFlow.js');
  const { predioDesocupadoFlow } = await import('./flow/Tramites/predioDesocupadoFlow.js');
  const { certificadosFlow } = await import('./flow/Tramites/certificadosFlow.js');
  const { mediaFlow } = await import('./flow/Multimedias/mediaFlow.js');
  const { volverMenuPrincipalFlow } = await import('./flow/Flujos/volverMenuFlow.js');
  const { tramitesFlow } = await import('./flow/Tramites/tramitesFlow.js');
  
  // Flujos de Reportes
  const { reportesFlow } = await import('./flow/MenusPrincipales/reportesFlow.js');
  const { aseoFlow } = await import('./flow/Reportes/Aseoflow.js');
  const { AcueductoAlcantarilladoFlow } = await import('./flow/Reportes/AcueductoAlcantarilladoFlow.js');

  const adapterDB = new MemoryDB();

  //ORDEN DE COMO SE INICIALIZA EL FLUJO 
  const adapterFlow = createFlow([
    blackholeFlow,
    welcomeFlow,
    conversacionalOrquestadorFlow,
    menuPrincipalFlow,
    masOpcionesFlow,
    masOpciones2Flow,
    masOpciones3Flow,
    horariosFlow,
    alumbradoFlow,
    comercialFlow,
    LuminariaApagadaFlow,
    LuminariaEncendidaFlow,
    reportesFlow,
    AcueductoAlcantarilladoFlow,
    fugaAguaFlow,
    sinServicioAguaFlow,
    alcantarilladoTapadoFlow,
    asesorFlow,
    MatriculaFlow,
    basuraCalleFlow,
    recolecionEspecialesFlow,
    SolicitudPodaFlow,
    volverMenuPrincipalFlow,
    lineasFlow,
    mediaFlow,
    aseoFlow,
    certificadosFlow,
    dobleFacturacionFlow,
    predioDesocupadoFlow,
    tramitesFlow,
    medidoresFlow,
  ]);

  /**CONFIG META */

  const adapterProvider = createProvider(Provider, {
    jwtToken: process.env.jwtToken,
    numberId: process.env.numberId,
    verifyToken: process.env.verifyToken,
    version: 'v25.0',
    downloadMedia: true,
    port: +PORT
  });

  console.log('✅ BOT EMCA INICIANDO...');

  const { handleCtx, httpServer } = await createBot(
    {
      flow: adapterFlow,
      provider: adapterProvider,
      database: adapterDB
    },
    {
      queue: {
        timeout: 60000,
        concurrencyLimit: 5
      }
    }
  );

  httpServer(+PORT);

  //LISTENER GLOBAL INTERCEPTOR CON BLOQUEO DE BOT
  adapterProvider.on('message', async (ctx: any) => {
    try {
      const telefono = limpiarTelefono(ctx?.from);
      if (!telefono) return;

      let textoMensaje = ctx?.body ?? '';
      
      if (typeof textoMensaje === 'string' && textoMensaje.startsWith('_event_')) {
        return;
      }

      let mediaUrl: string | null = null;
      let tipoMensaje = 'USUARIO_TEXTO';

      const isMedia = Boolean(
        ctx?.message?.imageMessage ||
        ctx?.message?.audioMessage ||
        ctx?.message?.videoMessage ||
        ctx?.message?.documentMessage
      );

      if (isMedia) {
        if (ctx?.message?.imageMessage) tipoMensaje = 'USUARIO_IMAGEN';
        else if (ctx?.message?.audioMessage) tipoMensaje = 'USUARIO_AUDIO';
        else if (ctx?.message?.videoMessage) tipoMensaje = 'USUARIO_VIDEO';
        else if (ctx?.message?.documentMessage) tipoMensaje = 'USUARIO_DOCUMENTO';

        try {
          const backendUploadsFolder = path.resolve(process.cwd(), '../backend/src/uploads');
          if (!fs.existsSync(backendUploadsFolder)) {
            fs.mkdirSync(backendUploadsFolder, { recursive: true });
          }

          const downloadPromise = adapterProvider.saveFile(ctx, {
            path: backendUploadsFolder
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout de descarga')), 1500)
          );

          const localPath = (await Promise.race([downloadPromise, timeoutPromise])) as string;

          if (localPath && fs.existsSync(localPath)) {
            mediaUrl = path.basename(localPath);
          }
        } catch (mediaError) {
          console.error('⚠️ Descarga multimedia omitida de forma segura:', mediaError);
        }
      }

      // Guardar el mensaje del usuario en Express/MySQL
      if (textoMensaje.trim() !== '' || mediaUrl) {
        await guardarMensaje(
          telefono,
          textoMensaje,
          'USUARIO',
          [],
          mediaUrl,
          tipoMensaje
        );
      }

      // SI EL USUARIO ESTÁ PAUSADO, SE LOGGEA Y NO HACE NADA MÁS
      if (usuariosPausados.has(telefono)) {
        console.log(`🛑 Mensaje de ${telefono} recibido mientras el BOT está pausado. Se ignora la respuesta del bot.`);
      }

    } catch (error) {
      console.error('❌ ERROR EN LISTENER GLOBAL:', error);
    }
  });

  // Endpoints HTTP para pausar y reactivar
  adapterProvider.server.post('/v1/pausar-bot-local', (req: any, res: any) => {
    const { telefono } = req.body || {};
    if (telefono) usuariosPausados.add(limpiarTelefono(telefono));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  });

  adapterProvider.server.post('/v1/reactivar-local', (req: any, res: any) => {
    const { telefono } = req.body || {};
    if (telefono) {
      usuariosPausados.delete(limpiarTelefono(telefono));
      console.log(`🤖 BOT Reactivado localmente para: ${telefono}`);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  });

  adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      try {
        const { number, message, urlMedia, buttons } = req.body || {};
        if (!number || (!message && !urlMedia)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Faltan parámetros requeridos' }));
        }

        const cleanNumber = limpiarTelefono(number);

        await bot.sendMessage(cleanNumber, message || '', {
          media: urlMedia ?? null,
          buttons: buttons ?? []
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true }));
      } catch (error: any) {
        console.error('❌ Error enviando mensaje por API externa:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: error.message }));
      }
    })
  );
};

process.on('uncaughtException', (err) => {
  console.error('⚠️ Excepción no capturada interceptada:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Promesa rechazada no capturada:', reason);
});

main();