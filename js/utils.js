/**
 * Devuelve la fecha local actual en formato "YYYY-MM-DD"
 */
export function obtenerFechaHoy() {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return `${anio}-${mes}-${dia}`;
}

/**
 * Elimina etiquetas HTML, acentos y convierte a minúsculas
 */
export function limpiarTexto(texto) {
    return String(texto || "")
        .replace(/<[^>]*>?/gm, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

/**
 * Filtra las reflexiones publicadas hasta hoy y las ordena de más reciente a más antigua
 */
export function obtenerPublicadas(reflexiones, fechaHoy = obtenerFechaHoy()) {
    if (!Array.isArray(reflexiones)) return [];
    return reflexiones
        .filter((item) => item.fecha && item.fecha <= fechaHoy)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/**
 * Busca coincidencias en título, cita, autor o texto, priorizando coincidencias en título
 */
export function filtrarReflexiones(lista, terminoCrudo) {
    const termino = limpiarTexto(terminoCrudo.trim());
    if (!termino) return lista;

    return lista
        .filter((post) => {
            const campos = [post.titulo, post.cita, post.autor, post.texto].map(limpiarTexto);
            return campos.some((campo) => campo.includes(termino));
        })
        .sort((a, b) => {
            const aEnTitulo = limpiarTexto(a.titulo).includes(termino);
            const bEnTitulo = limpiarTexto(b.titulo).includes(termino);
            if (aEnTitulo && !bEnTitulo) return -1;
            if (!aEnTitulo && bEnTitulo) return 1;
            return 0;
        });
}

/**
 * Extrae el primer párrafo limpio para usar como resumen o meta description SEO
 */
export function extraerResumen(htmlTexto, maxLongitud = 0) {
    const matchParrafo = String(htmlTexto || "").match(/<p>(.*?)<\/p>/s);
    const limpio = matchParrafo
        ? matchParrafo[1].replace(/<\/?[^>]+(>|$)/g, "").trim()
        : limpiarTexto(htmlTexto).trim();

    if (maxLongitud > 0 && limpio.length > maxLongitud) {
        return `${limpio.slice(0, maxLongitud - 3).trim()}...`;
    }
    return limpio;
}

/**
 * Calcula los minutos estimados de lectura (200 palabras/min)
 */
export function calcularTiempoLectura(textoPlano, palabrasPorMinuto = 200) {
    const totalPalabras = String(textoPlano || "").trim().split(/\s+/).filter(Boolean).length;
    return totalPalabras > 0 ? Math.ceil(totalPalabras / palabrasPorMinuto) : 0;
}

/**
 * Devuelve una reflexión aleatoria de las publicadas (excluyendo la actual si hay opciones)
 */
export function obtenerReflexionAleatoria(lista, idExcluir = null) {
    if (!Array.isArray(lista) || lista.length === 0) return null;
    const candidatas = lista.length > 1 && idExcluir
        ? lista.filter((item) => item.id !== idExcluir)
        : lista;
    const indice = Math.floor(Math.random() * candidatas.length);
    return candidatas[indice];
}

/**
 * Obtiene las reflexiones adyacentes (anterior y siguiente) dentro de la lista publicada.
 * Como la lista está ordenada de más reciente (índice 0) a más antigua:
 * - "siguiente" apunta hacia una fecha más reciente (índice - 1)
 * - "anterior" apunta hacia una fecha más antigua (índice + 1)
 */
export function obtenerNavegacionReflexion(reflexiones, idActual, fechaHoy = obtenerFechaHoy()) {
    const publicadas = obtenerPublicadas(reflexiones, fechaHoy);
    const indice = publicadas.findIndex((item) => item.id === idActual);

    if (indice === -1) {
        return { anterior: null, siguiente: null };
    }

    return {
        siguiente: indice > 0 ? publicadas[indice - 1] : null,
        anterior: indice < publicadas.length - 1 ? publicadas[indice + 1] : null
    };
}