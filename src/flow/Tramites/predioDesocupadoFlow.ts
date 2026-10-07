import { addKeyword } from '@builderbot/bot'
import { guardarMensaje, obtenerTextoLimpio } from '../conexionApi.js'
import { menuPrincipalFlow } from '../MenusPrincipales/menuPrincipalFlow.js'
import { usuariosPausados } from '../../app.js'


const mensajePredio = `Requisitos y documentos obligatorios:

Dirección exacta del inmueble.

Documento de identidad original y fotocopia de la cédula.

Documento que acredite la propiedad del inmueble (Certificado de Libertad y Tradición o Escritura).

Copia de la última factura del servicio de energía (luz).

Nota importante: Posterior a la entrega de documentos, se programará una visita técnica de verificación dentro de los 15 días hábiles siguientes.

Atención Presencial:

Dirección: Carrera 24 #39-54, Calarcá - Quindío

Horario: Lunes a viernes de 7:30 a.m. a 5:30 p.m.

Haz clic en el botón de abajo para regresar:`

/**
 * @file predioDesocupadoFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de suministrar información relacionada con
 * trámites de predios, cambios de propietario y traspasos de vivienda.
 * Permite orientar al usuario sobre los requisitos documentales, el
 * procedimiento presencial y los canales de atención habilitados por EMCA.
 */


const botones = ['Menú principal']

export const predioDesocupadoFlow = addKeyword(['💧 Predio', 'predio'])
 
.addAction(async (ctx: any) => {
    
  await guardarMensaje(
         ctx.from,
         mensajePredio,
         'BOT',
         botones
        )
  })
  .addAnswer(
    mensajePredio,
    {
      buttons: [{ body: 'Menú principal' }],
      capture: true
    },
      async (ctx: any, { gotoFlow, fallBack, endFlow }) => {
          const telefono = ctx.from;
          const bodyText = String(ctx.body || '').trim();
    
          if (usuariosPausados.has(telefono) || bodyText.startsWith('_event_')) {
            return endFlow();
          }
    
          const opcion = obtenerTextoLimpio(bodyText)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    
    
          if (opcion.includes('menu') || opcion.includes('princip')) {
            return gotoFlow(menuPrincipalFlow);
          }
    
          const msgError = '⚠️ Por favor, presiona el botón para regresar.';
          return fallBack(msgError);
        }
  )