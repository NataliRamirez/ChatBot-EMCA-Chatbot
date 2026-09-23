import { addKeyword } from "@builderbot/bot";
import { guardarMensaje, obtenerTextoLimpio } from "../conexionApi.js";
import { menuPrincipalFlow } from "../MenusPrincipales/menuPrincipalFlow.js";

/**
 * @file MatriculaFlow.ts
 * @author Juan David Nieto
 * @description Flujo encargado de brindar información sobre los requisitos
 * necesarios para realizar solicitudes de matrícula de servicios públicos,
 * incluyendo documentación requerida para diferentes modalidades y datos
 * de atención presencial.
 */

// Parte 1: Documentación requerida (Menos de 1024 caracteres)
const mensajeMatriculaParte1 = `📋 *NUEVA MATRÍCULA*

Tener en cuenta los siguientes documentos:

*INDIVIDUO / INDEPENDIENTE:*
1- Formato de solicitud F-PT-022.
2- Copia de documento de identidad del propietario.
3- Poder amplio y suficiente (si aplica).
4- Copia del certificado de tradición y libertad (< 3 meses).
5- Certificado de estratificación con nomenclatura correcta.
6- Factura de compra del medidor (si no es de EMCA ESP).
7- Copia de última factura cancelada.

*TEMPORAL EN CONSTRUCCIÓN:*
1- Formato F-PT-022.
2- Copia documento de identidad.
3- Poder amplio y suficiente.
4- Certificado de tradición y libertad (< 3 meses).
5- Carta compromisoria F-PT-003.
6- Licencia de construcción/urbanismo vigente.`;

// Parte 2: Requisitos definitivos y atención
const mensajeMatriculaParte2 = `*DEFINITIVAS:*
1- Formato F-PT-022.
2- Copia documento de identidad.
3- Poder amplio y suficiente.
4- Certificado de tradición y libertad (< 3 meses).
5- Certificado de estratificación.
6- Permiso de vertimientos (CRQ) si aplica.
7- Carta de responsabilidad del constructor.

📍 *Atención Presencial:*
Diríjase a la Carrera 24 #39-54.
🕒 Lunes a Viernes: 7:30 a.m. - 5:30 p.m.
Solicitar el documento de conexión al servicio.`;

const botonesMatricula = ['Menú principal'];

export const MatriculaFlow = addKeyword(['matricula_node_action', 'matricula', 'matrícula'])
  // Registramos en BD el envío del módulo de matrícula
  .addAction(async (ctx: any) => {
    const telefono = ctx.from;
    const mensajeCompleto = `${mensajeMatriculaParte1}\n\n${mensajeMatriculaParte2}`;
    await guardarMensaje(
      telefono,
      mensajeCompleto,
      'BOT',
      botonesMatricula,
      null,
      'BOT_BOTONES'
    ).catch(() => {});
  })
  // Bloque 1: Envía la primera parte del texto
  .addAnswer(mensajeMatriculaParte1)
  // Bloque 2: Envía la segunda parte con los botones interactivos
  .addAnswer(
    mensajeMatriculaParte2,
    {
      buttons: [{ body: 'Menú principal' }],
      capture: true
    },
    async (ctx: any, { gotoFlow, fallBack }) => {
      const bodyText = String(ctx.body || '').trim();
      const opcion = obtenerTextoLimpio(bodyText).toLowerCase();

      if (opcion.includes('menu') || opcion.includes('principal')) {
        return gotoFlow(menuPrincipalFlow);
      }

      return fallBack('⚠️ Selecciona una opción válida haciendo clic en el botón.');
    }
  );