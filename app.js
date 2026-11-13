document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById("featured-container");
    const gridContainer = document.getElementById("grid-container");

    if (typeof reflexiones === "undefined" || !reflexiones.length) return;

    // 1. Obtener la fecha local actual en formato "YYYY-MM-DD"
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const fechaHoy = `${anio}-${mes}-${dia}`;

    // 2. Filtrar publicaciones disponibles hasta hoy y ordenar de la más reciente a la más antigua
    const publicadas = reflexiones
        .filter(item => item.fecha && item.fecha <= fechaHoy)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

    if (!publicadas.length) return;

    // 3. Post del Día (La publicación más reciente disponible hoy)
    const delDia = publicadas[0];
    
    const matchParrafo = delDia.texto.match(/<p>(.*?)<\/p>/s);
    const resumenAuto = matchParrafo ? matchParrafo[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "";

    featuredContainer.innerHTML = `
        <span class="badge">Reflexión del Día</span>
        <article class="featured-card">
            <div class="featured-image">
                <img src="${delDia.imagen}" alt="${delDia.titulo}">
            </div>
            <div class="featured-content">
                <h2>${delDia.titulo}</h2>
                <p class="featured-excerpt">"${delDia.cita}"</p>
                <p class="featured-summary">${resumenAuto}</p>
                <a href="detalle.html?id=${delDia.id}" class="btn-more">Leer reflexión completa</a>
            </div>
        </article>
    `;

    // 4. Grid de entradas anteriores (de la posición 1 en adelante)
    const historial = publicadas.slice(1);
    gridContainer.innerHTML = historial.map(item => `
        <article class="card">
            <h2>${item.titulo}</h2>
            <img src="${item.imagen}" alt="${item.titulo}">
            <p>"${item.cita}"</p>
            ${item.autor ? `<p class="author">${item.autor}</p>` : ''}
            <a href="detalle.html?id=${item.id}" class="btn-read-more">Leer más</a>
        </article>
    `).join("");
});