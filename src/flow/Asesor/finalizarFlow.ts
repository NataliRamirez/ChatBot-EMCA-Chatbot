import { addKeyword } from '@builderbot/bot'
import { guardarMensaje } from '../conexionApi.js'

/**
 * @file flowGracias.ts
 * @author Juan David Nieto
 * @description Flujo encargado de finalizar una conversación con el usuario,
 * enviando un mensaje de agradecimiento institucional y notificando la
 * disponibilidad futura de los canales de atención de EMCA.
 */

export const flowGracias = addKeyword([
    'gracias',
    'finalizar',
    'terminar',
    'bye', 
    'chao'
])
.addAnswer(
[
    `✅ Atención personalizada finalizada.,`,
    ` EMCA agradece tu contacto.
    Escribe *HOLA* cuando necesites ayuda nuevamente.`,
],

null,

async (ctx: any) => {

     guardarMensaje(
        ctx.from,
        `✅ Fue un gusto atenderte.
         EMCA agradece tu contacto.
         Escribe *HOLA* cuando necesites ayuda nuevamente.`,
        'BOT'
    );
});
