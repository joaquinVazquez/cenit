document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById("featured-container");
    const gridContainer = document.getElementById("grid-container");

    if (typeof reflexiones === "undefined" || !reflexiones.length) return;

    // 1. Post del Día (Primer elemento del arreglo)
    const delDia = reflexiones[0];
    
    // Extraer el texto del primer párrafo para el resumen en el post destacado
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

    // 2. Grid de entradas anteriores (de la posición 1 en adelante)
    const historial = reflexiones.slice(1);
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