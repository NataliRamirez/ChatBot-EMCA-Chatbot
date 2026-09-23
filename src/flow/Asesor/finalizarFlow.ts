import { addKeyword } from '@builderbot/bot'
import { guardarMensaje } from '../conexionApi.js'

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
