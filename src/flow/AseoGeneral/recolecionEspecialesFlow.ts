import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeRecolecionBasura = 'RECOLECCIÓN DE RESIDUOS ESPECIALES Para programar la recolección de objetos voluminosos (muebles, colchones, escombros o enseres), te invitamos a comunicarte con nuestras líneas de atención para coordinar la recogida en tu sector: Líneas de Atención y Programación: 302 409 1910';
const botones = ['Menú principal'];

// Se agregan palabras clave explícitas
export const recolecionEspecialesFlow = addKeyword(['recoleccion_especiales_action', 'residuos especiales', 'recoleccion escombros'])
  
.addAction(async (ctx: any) =>{

  await guardarMensaje(
    ctx.from,
    mensajeRecolecionBasura,
    'BOT',
    botones
  )
})

.addAnswer(
    mensajeRecolecionBasura,
    {
      buttons: [{ body: 'Menú principal' }],
      capture: true
    },
   
  );