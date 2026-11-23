import { extraerResumen, esReflexionLeida } from "./utils.js";

function renderBadgeLeida(id) {
    return esReflexionLeida(id)
        ? `<span class="badge-leida" aria-label="Reflexión leída">Leída</span>`
        : "";
}

/**
 * Genera el HTML de una tarjeta estándar del grid
 */
export function crearTarjetaHTML(item) {
    const leida = esReflexionLeida(item.id);
    const badgeLeida = renderBadgeLeida(item.id);

    return `
        <article class="card ${leida ? "is-leida" : ""}">
            <h2>${item.titulo}</h2>
            <img src="${item.imagen}" alt="${item.titulo}" loading="lazy">
            <p>"${item.cita}"</p>
            ${item.autor ? `<p class="author">${item.autor}</p>` : ""}
            <div class="card-actions">
                <a href="detalle.html?id=${item.id}" class="btn-read-more">Leer más</a>
                ${badgeLeida}
            </div>
        </article>
    `;
}

/**
 * Renderiza la tarjeta destacada principal en index.html
 */
export function renderizarDestacada(container, delDia, fechaHoy) {
    if (!container || !delDia) return;

    const esDeHoy = delDia.fecha === fechaHoy;
    const textoBadge = esDeHoy ? "🟢 PUBLICADO HOY" : "Reflexión del Día";
    const claseBadge = esDeHoy ? "badge is-today" : "badge";
    const badgeLeida = renderBadgeLeida(delDia.id);
    const resumenAuto = extraerResumen(delDia.texto);

    container.style.display = "block";
    container.innerHTML = `
        <span class="${claseBadge}">${textoBadge}</span>
        <article class="featured-card">
            <div class="featured-image">
                <img src="${delDia.imagen}" alt="${delDia.titulo}">
            </div>
            <div class="featured-content">
                <h2>${delDia.titulo}</h2>
                <p class="featured-excerpt">"${delDia.cita}"</p>
                <p class="featured-summary">${resumenAuto}</p>
                <div class="featured-actions">
                    <a href="detalle.html?id=${delDia.id}" class="btn-more">Leer reflexión completa</a>
                    ${badgeLeida}
                </div>
            </div>
        </article>
    `;
}

/**
 * Renderiza el listado del grid (historial o resultados de búsqueda)
 */
export function renderizarGrid(container, lista, esBusqueda = false) {
    if (!container) return;

    if (esBusqueda && lista.length === 0) {
        container.innerHTML = `
            <p class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem; opacity: 0.8;">
                No se encontraron reflexiones que coincidan con tu búsqueda.
            </p>
        `;
        return;
    }

    container.innerHTML = lista.map(crearTarjetaHTML).join("");
}

/**
 * Actualiza el contador de resultados en modo búsqueda
 */
export function renderizarContador(contadorEl, total, visible) {
    if (!contadorEl) return;

    if (!visible) {
        contadorEl.hidden = true;
        return;
    }

    contadorEl.hidden = false;
    const etiqueta = total === 1 ? "reflexión encontrada" : "reflexiones encontradas";
    contadorEl.innerHTML = `Mostrando <span>${total}</span> ${etiqueta}`;
}