import AsyncStorage from '@react-native-async-storage/async-storage';
import { TokenResponse } from 'expo-auth-session';
import { getAccessToken, saveAccessToken } from './tokenStorage';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'google_access_token',
} as const;

export async function guardarTokens(tokenResponse: TokenResponse) {
  if (tokenResponse.accessToken) {
    await saveAccessToken(tokenResponse.accessToken);
    // await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.accessToken);
  }
}

async function getValidAccessToken(): Promise<string> {
  // const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('No hay sesión activa. Inicia sesión con Google.');
  return accessToken;
}

// --------------------- Subida de archivos a Google Drive ---------------------

async function buscarArchivoPorNombre(nombreArchivo: string, accessToken: string) {
  const q = encodeURIComponent(`name='${nombreArchivo}' and trashed=false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Error al buscar archivo: ${res.status}`);
  const json = await res.json();
  return json.files && json.files.length > 0 ? json.files[0] : null;
}

export async function subirArchivoADrive(
  nombreArchivo: string,
  contenido: string,
  mimeType = 'application/json'
) {
  const accessToken = await getValidAccessToken();
  const encontrado = await buscarArchivoPorNombre(nombreArchivo, accessToken);

  if (encontrado) {
    const fileId = encontrado.id;
    const resp = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': mimeType,
        },
        body: contenido,
      }
    );

    if (!resp.ok) throw new Error(`Error al actualizar archivo: ${resp.status}`);
    return fileId;
  }

  const boundary = 'expo_boundary_' + Date.now();
  const metadatos = JSON.stringify({ name: nombreArchivo, mimeType });
  const cuerpo =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${metadatos}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n` +
    `${contenido}\r\n` +
    `--${boundary}--`;

  const creacion = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: cuerpo,
  });

  if (!creacion.ok) throw new Error(`Error al crear archivo: ${creacion.status}`);
  const result = await creacion.json();
  return result.id;
}

export async function subirTodasLasClavesComoArchivos() {
  const allKeys = await AsyncStorage.getAllKeys();
  const keysToSync = allKeys.filter((k) => k && k.startsWith('orbital'));
  if (!keysToSync || keysToSync.length === 0) return [];

  const entries = await AsyncStorage.multiGet(keysToSync);
  const resultados: { key: string; id?: string; error?: string }[] = [];

  for (const [key, value] of entries) {
    try {
      const safeName = key.replace(/[:/\\]/g, '_') + '.json';
      const id = await subirArchivoADrive(safeName, value ?? '', 'application/json');
      resultados.push({ key, id });
    } catch (err: any) {
      resultados.push({ key, error: String(err?.message ?? err) });
    }
  }

  return resultados;
}

export async function sincronizarConDrive() {
  const nombreArchivo = 'orbital-notes.json';
  const allKeys = await AsyncStorage.getAllKeys();
  const keysToSync = allKeys.filter((k) => k && k.startsWith('orbital'));
  const entries = await AsyncStorage.multiGet(keysToSync);
  const datosObj: Record<string, string | null> = {};
  entries.forEach(([k, v]) => (datosObj[k] = v));
  const datos = JSON.stringify(datosObj);
  return subirArchivoADrive(nombreArchivo, datos, 'application/json');
}

export async function descargarDesdeDrive() {
  const accessToken = await getValidAccessToken();
  let nombreArchivo: string = 'orbital-notes.json';
  const archivo = await buscarArchivoPorNombre(nombreArchivo, accessToken);
  if (!archivo) throw new Error(`No se encontró el archivo "${nombreArchivo}" en Drive.`);
  
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${archivo.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) throw new Error(`Error al descargar archivo: ${res.status}`);
  return await res.json();
}
