document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById("featured-container");
    const gridContainer = document.getElementById("grid-container");
    const inputBuscador = document.getElementById("buscador");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const contadorResultados = document.getElementById("contador-resultados");

    if (typeof reflexiones === "undefined" || !reflexiones.length) return;

    // 1. Obtener fecha local actual "YYYY-MM-DD"
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const fechaHoy = `${anio}-${mes}-${dia}`;

    // 2. Filtrar solo los ya publicados y ordenar del más reciente al más antiguo
    const publicadas = reflexiones
        .filter(item => item.fecha && item.fecha <= fechaHoy)
        .sort((a, b) => b.fecha.localeCompare(a.fecha));

    if (!publicadas.length) return;

    // Función auxiliar para quitar acentos y etiquetas HTML
    function limpiarTexto(texto) {
        return String(texto)
            .replace(/<[^>]*>?/gm, "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    // Función para generar el HTML de una tarjeta del grid
    function crearTarjetaHTML(item) {
        return `
            <article class="card">
                <h2>${item.titulo}</h2>
                <img src="${item.imagen}" alt="${item.titulo}">
                <p>"${item.cita}"</p>
                ${item.autor ? `<p class="author">${item.autor}</p>` : ""}
                <a href="detalle.html?id=${item.id}" class="btn-read-more">Leer más</a>
            </article>
        `;
    }

    // 3. Función principal de renderizado (Vista normal vs. Vista búsqueda)
    function renderizarVista(lista, esBusqueda = false) {
        if (!esBusqueda) {
            if (featuredContainer) featuredContainer.style.display = "block";
            if (contadorResultados) contadorResultados.hidden = true;

            if (featuredContainer) {
                const delDia = lista[0];
                const esDeHoy = delDia.fecha === fechaHoy;
                const textoBadge = esDeHoy ? "🟢 PUBLICADO HOY" : "Reflexión del Día";
                const claseBadge = esDeHoy ? "badge is-today" : "badge";

                const matchParrafo = (delDia.texto || "").match(/<p>(.*?)<\/p>/s);
                const resumenAuto = matchParrafo ? matchParrafo[1].replace(/<\/?[^>]+(>|$)/g, "").trim() : "";

                featuredContainer.innerHTML = `
                    <span class="${claseBadge}">${textoBadge}</span>
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
            }

            if (gridContainer) {
                const historial = lista.slice(1);
                gridContainer.innerHTML = historial.map(crearTarjetaHTML).join("");
            }
        } else {
            if (featuredContainer) featuredContainer.style.display = "none";

            if (contadorResultados) {
                contadorResultados.hidden = false;
                const etiqueta = lista.length === 1 ? "reflexión encontrada" : "reflexiones encontradas";
                contadorResultados.innerHTML = `Mostrando <span>${lista.length}</span> ${etiqueta}`;
            }

            if (gridContainer) {
                if (lista.length === 0) {
                    gridContainer.innerHTML = `
                        <p class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 2rem; opacity: 0.8;">
                            No se encontraron reflexiones que coincidan con tu búsqueda.
                        </p>
                    `;
                    return;
                }

                gridContainer.innerHTML = lista.map(crearTarjetaHTML).join("");
            }
        }
    }

    // Función para reiniciar la búsqueda por completo
    function resetearBusqueda() {
        if (!inputBuscador) return;
        inputBuscador.value = "";
        if (btnLimpiar) btnLimpiar.hidden = true;
        renderizarVista(publicadas, false);
        inputBuscador.focus();
    }

    // Renderizado inicial
    renderizarVista(publicadas, false);

    // 4. Eventos del buscador en tiempo real
    if (inputBuscador) {
        inputBuscador.addEventListener("input", (e) => {
            const valorCrudo = e.target.value;
            const termino = limpiarTexto(valorCrudo.trim());

            if (btnLimpiar) {
                btnLimpiar.hidden = valorCrudo.length === 0;
            }

            if (termino === "") {
                renderizarVista(publicadas, false);
                return;
            }

            const resultados = publicadas
                .filter((post) => {
                    const tituloLimpio = limpiarTexto(post.titulo || "");
                    const citaLimpia = limpiarTexto(post.cita || "");
                    const autorLimpio = limpiarTexto(post.autor || "");
                    const textoLimpio = limpiarTexto(post.texto || "");

                    return (
                        tituloLimpio.includes(termino) ||
                        citaLimpia.includes(termino) ||
                        autorLimpio.includes(termino) ||
                        textoLimpio.includes(termino)
                    );
                })
                .sort((a, b) => {
                    const aEnTitulo = limpiarTexto(a.titulo || "").includes(termino);
                    const bEnTitulo = limpiarTexto(b.titulo || "").includes(termino);

                    if (aEnTitulo && !bEnTitulo) return -1;
                    if (!aEnTitulo && bEnTitulo) return 1;
                    return 0;
                });

            renderizarVista(resultados, true);
        });

        // Atajo de teclado: presionar Escape limpia la búsqueda
        inputBuscador.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && inputBuscador.value !== "") {
                resetearBusqueda();
            }
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", resetearBusqueda);
    }
});