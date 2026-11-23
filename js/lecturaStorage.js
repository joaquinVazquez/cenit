const STORAGE_KEY_LEIDAS = "cenit_reflexiones_leidas_v1";

export function obtenerReflexionesLeidas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEIDAS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (error) {
    console.warn("No se pudo leer el historial de lecturas:", error);
    return [];
  }
}

function guardarReflexionesLeidas(ids) {
  try {
    localStorage.setItem(STORAGE_KEY_LEIDAS, JSON.stringify([...new Set(ids.map(String))]));
  } catch (error) {
    console.warn("No se pudo guardar el historial de lecturas:", error);
  }
}

export function esReflexionLeida(id) {
  const idStr = String(id);
  return obtenerReflexionesLeidas().includes(idStr);
}

export function alternarReflexionLeida(id) {
  const idStr = String(id);
  const actuales = obtenerReflexionesLeidas();
  const existe = actuales.includes(idStr);

  const actualizadas = existe
    ? actuales.filter((item) => item !== idStr)
    : [...actuales, idStr];

  guardarReflexionesLeidas(actualizadas);
  return !existe; // retorna el nuevo estado (true = leída, false = no leída)
}