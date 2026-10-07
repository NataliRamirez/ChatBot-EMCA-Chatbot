import path from 'path';
import fs from 'fs';
import * as dotenv from 'dotenv';

import {
  createBot,
  createProvider,
  createFlow,
  MemoryDB
} from '@builderbot/bot';

import { MetaProvider as Provider } from '@builderbot/provider-meta';

import { guardarMensaje } from './flow/conexionApi.js';
import { blackholeFlow } from './flow/Multimedias/blackholFlow.js';

dotenv.config();

const PORT = process.env.PORT ?? 3008;

/* =========================================================
   ESTADOS GLOBALES
========================================================= */

export const usuariosPausados = new Set<string>();
export const usuariosEnRegistro = new Set<string>();

/* =========================================================
   LIMPIAR TELÉFONO
========================================================= */

const limpiarTelefono = (phone: string): string => {
  if (!phone) return '';

  return String(phone)
    .replace(/@c\.us|@s\.whatsapp\.net/g, '')
    .replace(/\D/g, '');
};

/* =========================================================
   OBTENER CARPETA DE UPLOADS DEL BACKEND
========================================================= */

const obtenerUploadsFolder = (): string => {
  const uploadsFolder = path.resolve(
    process.cwd(),
    '../backend/uploads'
  );

  if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, {
      recursive: true
    });

    console.log(`📁 Carpeta uploads creada: ${uploadsFolder}`);
  }

  return uploadsFolder;
};

/* =========================================================
   DETECTAR TIPO DE MULTIMEDIA
========================================================= */

const detectarTipoMedia = (ctx: any): string => {
  const message = ctx?.message || {};

  if (message.imageMessage) {
    return 'USUARIO_IMAGEN';
  }

  if (message.audioMessage) {
    return 'USUARIO_AUDIO';
  }

  if (message.videoMessage) {
    return 'USUARIO_VIDEO';
  }

  if (message.documentMessage) {
    return 'USUARIO_DOCUMENTO';
  }

  return 'USUARIO_TEXTO';
};

/* =========================================================
   MAIN
========================================================= */

const main = async () => {
  /* =======================================================
     IMPORTAR FLOWS
  ======================================================= */

  const { welcomeFlow } =
    await import('./flow/Flujos/welcomeFlow.js');

  const { conversacionalOrquestadorFlow } =
    await import(
      './flow/conversacionalOrquestador/conversacionalOrquestadorFlow.js'
    );

  const { menuPrincipalFlow } =
    await import('./flow/MenusPrincipales/menuPrincipalFlow.js');

  const { masOpcionesFlow } =
    await import('./flow/MenusPrincipales/masOpcionesFlow.js');

  const { masOpciones2Flow } =
    await import('./flow/MenusPrincipales/masOpciones2Flow.js');

  const { masOpciones3Flow } =
    await import('./flow/MenusPrincipales/masOpciones3Flow.js');

  const { horariosFlow } =
    await import('./flow/Horarios/horariosFlow.js');

  const { lineasFlow } =
    await import('./flow/Horarios/LineasFlow.js');

  const { alumbradoFlow } =
    await import('./flow/Alumbrado/AlumbradoFlow.js');

  const { comercialFlow } =
    await import('./flow/Alumbrado/comercialFlow.js');

  const { LuminariaEncendidaFlow } =
    await import('./flow/Alumbrado/LuminariaEncendida.js');

  const { LuminariaApagadaFlow } =
    await import('./flow/Alumbrado/LuminariaApagada.js');

  const { alcantarilladoTapadoFlow } =
    await import(
      './flow/AcueductoAlcantarillado/alcantarilladoTapadoFlow.js'
    );

  const { fugaAguaFlow } =
    await import('./flow/AcueductoAlcantarillado/fugaAgua.js');

  const { sinServicioAguaFlow } =
    await import(
      './flow/AcueductoAlcantarillado/sinServicioAguaFlow.js'
    );

  const { asesorFlow } =
    await import('./flow/Asesor/asesorFlow.js');

  const { MatriculaFlow } =
    await import('./flow/Asesor/MatriculaFlow.js');

  const { dobleFacturacionFlow } =
    await import('./flow/Tramites/dobleFacturacion.js');

  const { basuraCalleFlow } =
    await import('./flow/AseoGeneral/basurasCalleFlow.js');

  const { recolecionEspecialesFlow } =
    await import(
      './flow/AseoGeneral/recolecionEspecialesFlow.js'
    );

  const { SolicitudPodaFlow } =
    await import('./flow/AseoGeneral/SolicitudPodaFlow.js');

  const { medidoresFlow } =
    await import('./flow/medidoresFlow.js');

  const { predioDesocupadoFlow } =
    await import('./flow/Tramites/predioDesocupadoFlow.js');

  const { certificadosFlow } =
    await import('./flow/Tramites/certificadosFlow.js');

  const { mediaFlow } =
    await import('./flow/Multimedias/mediaFlow.js');

  const { volverMenuPrincipalFlow } =
    await import('./flow/Flujos/volverMenuFlow.js');

  const { tramitesFlow } =
    await import('./flow/Tramites/tramitesFlow.js');

  /* =======================================================
     REPORTES
  ======================================================= */

  const { reportesFlow } =
    await import('./flow/MenusPrincipales/reportesFlow.js');

  const { aseoFlow } =
    await import('./flow/Reportes/Aseoflow.js');

  const { AcueductoAlcantarilladoFlow } =
    await import(
      './flow/Reportes/AcueductoAlcantarilladoFlow.js'
    );

  /* =======================================================
     DATABASE
  ======================================================= */

  const adapterDB = new MemoryDB();

  /* =======================================================
     FLOWS
  ======================================================= */

  const adapterFlow = createFlow([
    blackholeFlow,

    welcomeFlow,
    conversacionalOrquestadorFlow,

    menuPrincipalFlow,
    masOpcionesFlow,
    masOpciones2Flow,
    masOpciones3Flow,

    horariosFlow,
    lineasFlow,

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

    mediaFlow,
    aseoFlow,

    certificadosFlow,
    dobleFacturacionFlow,
    predioDesocupadoFlow,
    tramitesFlow,
    medidoresFlow
  ]);

  /* =======================================================
     PROVIDER META
  ======================================================= */

  const adapterProvider = createProvider(Provider, {
    jwtToken: process.env.jwtToken,
    numberId: process.env.numberId,
    verifyToken: process.env.verifyToken,
    version: 'v25.0',
    downloadMedia: true,
    port: +PORT
  });

  console.log('==========================================');
  console.log('🚀 BOT EMCA INICIANDO...');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log('==========================================');

  /* =======================================================
     CREAR BOT
  ======================================================= */

  const {
    handleCtx,
    httpServer
  } = await createBot(
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

  /* =======================================================
     ENDPOINT ADMIN → WHATSAPP
  ======================================================= */

  adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      try {
        const {
          number,
          message,
          urlMedia,
          media,
          buttons,
          tipoMensaje
        } = req.body || {};

        const multimediaUrl =
          urlMedia || media || null;

        /* ---------------------------------------------------
           VALIDAR DATOS
        --------------------------------------------------- */

        if (
          !number ||
          (
            (!message || String(message).trim() === '') &&
            !multimediaUrl
          )
        ) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          return res.end(
            JSON.stringify({
              success: false,
              error: 'Faltan parámetros requeridos'
            })
          );
        }

        /* ---------------------------------------------------
           LIMPIAR TELÉFONO
        --------------------------------------------------- */

        const cleanNumber = limpiarTelefono(number);

        if (!cleanNumber) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          return res.end(
            JSON.stringify({
              success: false,
              error: 'Número de teléfono inválido'
            })
          );
        }

        /* ---------------------------------------------------
           DETERMINAR TIPO
        --------------------------------------------------- */

        const esMultimedia = Boolean(multimediaUrl);

        const textoFinal =
          String(message || '').trim();

        let tipoFinal = tipoMensaje;

        if (!tipoFinal) {
          tipoFinal = esMultimedia
            ? 'ADMIN_DOCUMENTO'
            : 'ADMIN_TEXTO';
        }

        console.log('📤 ADMIN → WHATSAPP');

        console.log({
          telefono: cleanNumber,
          tipo: tipoFinal,
          media: multimediaUrl,
          mensaje: textoFinal
        });

        /* ---------------------------------------------------
           ENVIAR A WHATSAPP
        --------------------------------------------------- */

        await bot.sendMessage(
          cleanNumber,
          textoFinal,
          {
            media: multimediaUrl,
            buttons: buttons ?? []
          }
        );

        /* ---------------------------------------------------
           GUARDAR MENSAJE ADMIN
        --------------------------------------------------- */

        await guardarMensaje(
          cleanNumber,
          textoFinal,
          'ADMIN',
          buttons ?? [],
          multimediaUrl,
          tipoFinal
        );

        console.log(
          '💾 Mensaje ADMIN guardado correctamente'
        );

        /* ---------------------------------------------------
           RESPUESTA
        --------------------------------------------------- */

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        return res.end(
          JSON.stringify({
            success: true,
            multimedia: esMultimedia
          })
        );

      } catch (error: any) {
        console.error(
          '❌ Error enviando mensaje desde ADMIN:',
          error
        );

        res.writeHead(500, {
          'Content-Type': 'application/json'
        });

        return res.end(
          JSON.stringify({
            success: false,
            error:
              error?.message ||
              'Error enviando mensaje'
          })
        );
      }
    })
  );

  /* =======================================================
     PAUSAR BOT
  ======================================================= */

  adapterProvider.server.post(
    '/v1/pausar-bot-local',
    (req: any, res: any) => {
      try {
        const { telefono } = req.body || {};

        const cleanNumber =
          limpiarTelefono(telefono);

        if (!cleanNumber) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          return res.end(
            JSON.stringify({
              success: false,
              error: 'Número inválido'
            })
          );
        }

        usuariosPausados.add(cleanNumber);

        console.log(
          `🛑 BOT PAUSADO PARA: ${cleanNumber}`
        );

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        return res.end(
          JSON.stringify({
            success: true,
            telefono: cleanNumber,
            pausado: true
          })
        );

      } catch (error: any) {
        console.error(
          '❌ Error pausando bot:',
          error
        );

        res.writeHead(500, {
          'Content-Type': 'application/json'
        });

        return res.end(
          JSON.stringify({
            success: false,
            error:
              error?.message ||
              'Error pausando bot'
          })
        );
      }
    }
  );

  /* =======================================================
     REACTIVAR BOT
  ======================================================= */

  adapterProvider.server.post(
    '/v1/reactivar-local',
    (req: any, res: any) => {
      try {
        const { telefono } = req.body || {};

        const cleanNumber =
          limpiarTelefono(telefono);

        if (!cleanNumber) {
          res.writeHead(400, {
            'Content-Type': 'application/json'
          });

          return res.end(
            JSON.stringify({
              success: false,
              error: 'Número inválido'
            })
          );
        }

        usuariosPausados.delete(cleanNumber);

        console.log(
          `🤖 BOT REACTIVADO PARA: ${cleanNumber}`
        );

        res.writeHead(200, {
          'Content-Type': 'application/json'
        });

        return res.end(
          JSON.stringify({
            success: true,
            telefono: cleanNumber,
            pausado: false
          })
        );

      } catch (error: any) {
        console.error(
          '❌ Error reactivando bot:',
          error
        );

        res.writeHead(500, {
          'Content-Type': 'application/json'
        });

        return res.end(
          JSON.stringify({
            success: false,
            error:
              error?.message ||
              'Error reactivando bot'
          })
        );
      }
    }
  );

  /* =======================================================
     LISTENER GLOBAL DE MENSAJES DE WHATSAPP
  ======================================================= */

  adapterProvider.on(
    'message',
    async (ctx: any) => {
      try {
        /* ---------------------------------------------------
           TELÉFONO
        --------------------------------------------------- */

        const telefono =
          limpiarTelefono(ctx?.from);

        if (!telefono) {
          console.log(
            '⚠️ Mensaje recibido sin teléfono:',
            ctx
          );

          return;
        }

        /* ---------------------------------------------------
           EVENTOS INTERNOS
        --------------------------------------------------- */

        const body =
          typeof ctx?.body === 'string'
            ? ctx.body
            : '';

        if (body.startsWith('_event_')) {
          return;
        }

        /* ---------------------------------------------------
           DETERMINAR SI ESTÁ PAUSADO
        --------------------------------------------------- */

        const botPausado =
          usuariosPausados.has(telefono);

        if (botPausado) {
          console.log(
            `🛑 ${telefono} está siendo atendido por ADMIN.`
          );

          console.log(
            '💾 El mensaje se guardará igualmente.'
          );
        }

        /* ---------------------------------------------------
           TEXTO
        --------------------------------------------------- */

        const textoMensaje =
          body.trim();

        /* ---------------------------------------------------
           TIPO DE MENSAJE
        --------------------------------------------------- */

        const tipoMensaje =
          detectarTipoMedia(ctx);

        /* ---------------------------------------------------
           MULTIMEDIA
        --------------------------------------------------- */

        let mediaUrl: string | null = null;

        const esMultimedia =
          tipoMensaje !== 'USUARIO_TEXTO';

        if (esMultimedia) {
          try {
            const uploadsFolder =
              obtenerUploadsFolder();

            console.log(
              '📥 Multimedia recibida'
            );

            console.log({
              telefono,
              tipo: tipoMensaje,
              carpeta: uploadsFolder
            });

            /*
              Builderbot descarga el archivo
              y devuelve la ruta local.
            */

            const localPath =
              await adapterProvider.saveFile(
                ctx,
                {
                  path: uploadsFolder
                }
              );

            if (
              localPath &&
              fs.existsSync(localPath)
            ) {
              const fileName =
                path.basename(localPath);

              mediaUrl = fileName;

              console.log(
                `💾 Multimedia guardada: ${fileName}`
              );

              console.log(
                `🌐 URL: http://127.0.0.1:4000/uploads/${fileName}`
              );

            } else {
              console.error(
                '❌ Builderbot no devolvió una ruta válida para el multimedia.'
              );
            }

          } catch (mediaError) {
            console.error(
              '❌ Error guardando multimedia:',
              mediaError
            );
          }
        }

        /* ---------------------------------------------------
           GUARDAR MENSAJE DEL USUARIO
        --------------------------------------------------- */

        if (
          textoMensaje !== '' ||
          mediaUrl
        ) {
          console.log(
            '💾 Guardando mensaje USUARIO:',
            {
              telefono,
              mensaje: textoMensaje,
              tipo: tipoMensaje,
              media: mediaUrl,
              pausado: botPausado
            }
          );

          await guardarMensaje(
            telefono,
            textoMensaje,
            'USUARIO',
            [],
            mediaUrl,
            tipoMensaje
          );

          console.log(
            '✅ Mensaje USUARIO guardado correctamente'
          );

        } else {
          console.log(
            `⚠️ No se encontró contenido para guardar de ${telefono}`
          );
        }

        /*
          IMPORTANTE:

          NO hacemos return por estar pausado antes
          de guardar.

          El listener solamente registra el mensaje.

          El bloqueo real de la respuesta automática
          lo hace blackholeFlow.
        */

      } catch (error) {
        console.error(
          '❌ ERROR EN LISTENER GLOBAL:',
          error
        );
      }
    }
  );

  /* =======================================================
     CARPETA UPLOADS
  ======================================================= */

  obtenerUploadsFolder();

  /* =======================================================
     INFORMACIÓN DE INICIO
  ======================================================= */

  console.log('==========================================');
  console.log('✅ BOT EMCA LISTO');
  console.log(`🌐 API BOT: http://127.0.0.1:${PORT}`);
  console.log('💾 Registro de mensajes: ACTIVO');
  console.log('📎 Registro de multimedia: ACTIVO');
  console.log('🛑 Pausa por asesor: ACTIVA');
  console.log('==========================================');
};

/* =========================================================
   ERRORES GLOBALES
========================================================= */

process.on(
  'uncaughtException',
  (err) => {
    console.error(
      '⚠️ Excepción no capturada interceptada:',
      err.message
    );
  }
);

process.on(
  'unhandledRejection',
  (reason) => {
    console.error(
      '⚠️ Promesa rechazada no capturada:',
      reason
    );
  }
);

/* =========================================================
   INICIAR
========================================================= */

main();