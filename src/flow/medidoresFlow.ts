import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from './conexionApi.js'
import { masOpcionesFlow } from './MenusPrincipales/masOpcionesFlow.js'
import { usuariosPausados } from '../app.js'


const mensajeMedidor = `TRÁMITES Y REPORTES DE MEDIDORES

Para realizar la gestión o reporte de tu medidor de agua:

Revisión técnica de medidor

Cambio o sustitución

Medidor dañado o con fuga

Medidor detenido

Verificación de lectura

Puedes solicitar la atención tanto para medidores adquiridos con EMCA E.S.P. como para medidores propios del usuario.

Líneas de Atención y Reportes:

302 409 1910

302 409 1899

Atención Presencial:

Dirección: Carrera 24 #39-54, Calarcá - Quindío

Horario: Lunes a viernes de 7:30 a.m. a 12:00 m. y de 2:00 p.m. a 5:00 p.m.

Presiona el botón para regresar: `

/**
 * @file medidoresFlow.ts
 * @author Juan David Nieto
 * @description Flujo informativo encargado de orientar a los usuarios sobre
 * los trámites y solicitudes relacionados con medidores de servicios públicos.
 * Permite consultar información sobre revisiones, cambios, daños, verificaciones
 * de lectura y canales oficiales de atención de EMCA.
 */


const botones = ['Menú principal']

export const medidoresFlow = addKeyword(['Medidores', 'medidores', 'medidor'])
  .addAction(async (ctx: any) => {

    await guardarMensaje(
      ctx.from, 
      mensajeMedidor, 
      'BOT', 
      botones
    )

  })
  .addAnswer(
    mensajeMedidor,
    {
      buttons: [
        { body: 'Menú principal' }
      ],
      capture: true
    },
    async (ctx:any, {gotoFlow, fallBack, endFlow}) =>{
         const telefono = ctx.from;
         const  bodyText = String(ctx.body || '').trim();
   
         if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
                 return endFlow();
               }
         
               const opcion = obtenerTextoLimpio(bodyText)
                 .toLowerCase()
                 .normalize('NFD')
                 .replace(/[\u0300-\u036f]/g, '');
         
              
         
               if (opcion.includes('menu') || opcion.includes('princip')) {
                 return gotoFlow(masOpcionesFlow);
               }
         
               const msgError = '⚠️ Por favor, presiona el botón para regresar.';
              
               return fallBack(msgError);
       }
  )