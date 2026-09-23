import { addKeyword } from '@builderbot/bot';
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js';
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js';
import { usuariosPausados } from '../../app.js';

const mensajeRecolecionBasura = '🚛 *RECOLECCIÓN DE RESIDUOS ESPECIALES*\n\nHemos registrado tu reporte de falla en el alumbrado público. Por eso lo invitamos a realizar el reporte al siguiente numero telefonico 3024091910 o el 3024091899 y nuestro equipo técnico procederá a verificar el sector.\n\nPresiona el botón para regresar:';
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