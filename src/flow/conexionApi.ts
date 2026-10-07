import dotenv from 'dotenv';
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:4000/v1';
const API_KEY = process.env.API_KEY || 'EmcaSecret2026';

/**
 * Normaliza y limpia textos eliminando espacios extra
 */
export const obtenerTextoLimpio = (texto: any = ''): string => {
  if (texto === null || texto === undefined) return '';
  const textoString = typeof texto === 'string' ? texto : String(texto);
  return textoString.trim().replace(/\s+/g, ' ');
};

/**
 * Envía los datos del nuevo usuario al Backend Express
 */
export const registrarUsuarioBot = async ({
  telefono,
  nombre,
  cedula,
  email
}: {
  telefono: string,
  nombre: string,
  cedula: string,
  email: string 
}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000); // Máximo 3s

  try {
    const payload = { telefono, nombre, cedula, email };

    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`⚠️ Backend rechazó registro (${response.status}):`, errText);
      return { success: false, message: errText };
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error en registrarUsuarioBot:', error.message || error);
    return { success: false, message: error.message };
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Envía la petición HTTP POST al backend Express para guardar un mensaje de texto.
 */
export const guardarMensaje = async (
  telefono: string,
  mensaje: any = '',
  emisor: string = 'USUARIO',
  botones: any[] = [],
  urlMedia: string | null = null,
  tipoMensaje: string = 'TEXTO'
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    let finalTipoMensaje = tipoMensaje;
    if (tipoMensaje === 'TEXTO') {
      finalTipoMensaje = `${emisor}_TEXTO`;
    }

    let mensajeStr = '';
    if (typeof mensaje === 'string') {
      mensajeStr = mensaje;
    } else if (mensaje && typeof mensaje === 'object' && mensaje.body) {
      mensajeStr = String(mensaje.body);
    } else if (mensaje !== null && mensaje !== undefined) {
      mensajeStr = String(mensaje);
    }

    const textoLimpio = mensajeStr.trim();

    // Normalizamos el payload para enviar tanto snake_case como camelCase
    const payload = {
      telefono: String(telefono || ''),
      emisor,
      mensaje: textoLimpio !== '' ? textoLimpio : ' ',
      url_media: urlMedia || '',
      media_url: urlMedia || '',
      tipo_mensaje: finalTipoMensaje,
      tipo_media: finalTipoMensaje,
      botones: Array.isArray(botones) ? botones : []
    };

    const response = await fetch(`${API_BASE_URL}/messages/guardar`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`⚠️ Backend rechazó guardar mensaje (${response.status}):`, errText);
      return null;
    }

    return await response.json().catch(() => ({ success: true }));
  } catch (error: any) {
    console.error('❌ Error al guardar mensaje en Backend:', error.message || error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Sube un archivo adjunto al servidor Express mediante multipart/form-data
 */
export const guardarMultimediaBackend = async (file: File, telefono: string) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10s para subida

  try {
    const formData = new FormData();
    formData.append('archivo', file);
    formData.append('telefono', telefono);

    const response = await fetch(`${API_BASE_URL}/multimedia`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'x-api-key': API_KEY
        // NOTA: NO colocar 'Content-Type', el navegador adjunta automáticamente el boundary de multipart/form-data
      },
      body: formData
    });

    if (!response.ok) {
      const errDetail = await response.json().catch(() => ({}));
      throw new Error(errDetail.error || errDetail.message || `Error en el servidor backend (${response.status})`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('❌ Error al subir multimedia al backend:', error.message || error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};