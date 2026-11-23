import { reflexiones } from "../datos.js";
import { obtenerFechaHoy, obtenerPublicadas, filtrarReflexiones, obtenerReflexionAleatoria } from "./utils.js";
import { renderizarDestacada, renderizarGrid, renderizarContador } from "./render.js";

document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById("featured-container");
    const gridContainer = document.getElementById("grid-container");
    const inputBuscador = document.getElementById("buscador");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const contadorResultados = document.getElementById("contador-resultados");
    const btnAleatoria = document.getElementById("btn-aleatoria");

    const fechaHoy = obtenerFechaHoy();
    const publicadas = obtenerPublicadas(reflexiones, fechaHoy);

    if (!publicadas.length) {
        if (featuredContainer) featuredContainer.innerHTML = "";
        if (gridContainer) {
            gridContainer.innerHTML = `
                <p style="grid-column: 1 / -1; text-align: center; padding: 2rem; opacity: 0.8;">
                    No hay reflexiones publicadas disponibles todavía.
                </p>
            `;
        }
        return;
    }

    function actualizarVista(lista, esBusqueda = false) {
        if (!esBusqueda) {
            renderizarDestacada(featuredContainer, lista[0], fechaHoy);
            renderizarContador(contadorResultados, 0, false);
            renderizarGrid(gridContainer, lista.slice(1), false);
        } else {
            if (featuredContainer) featuredContainer.style.display = "none";
            renderizarContador(contadorResultados, lista.length, true);
            renderizarGrid(gridContainer, lista, true);
        }
    }

    function resetearBusqueda() {
        if (!inputBuscador) return;
        inputBuscador.value = "";
        if (btnLimpiar) btnLimpiar.hidden = true;
        actualizarVista(publicadas, false);
        inputBuscador.focus();
    }

    // Renderizado inicial
    actualizarVista(publicadas, false);

    // Eventos del buscador en tiempo real
    if (inputBuscador) {
        inputBuscador.addEventListener("input", (e) => {
            const valorCrudo = e.target.value;

            if (btnLimpiar) {
                btnLimpiar.hidden = valorCrudo.length === 0;
            }

            if (valorCrudo.trim() === "") {
                actualizarVista(publicadas, false);
                return;
            }

            const resultados = filtrarReflexiones(publicadas, valorCrudo);
            actualizarVista(resultados, true);
        });

        inputBuscador.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && inputBuscador.value !== "") {
                resetearBusqueda();
            }
        });
    }

    if (btnLimpiar) {
        btnLimpiar.addEventListener("click", resetearBusqueda);
    }

    if (btnAleatoria) {
        btnAleatoria.addEventListener("click", () => {
            const elegida = obtenerReflexionAleatoria(publicadas, publicadas[0]?.id);
            if (elegida) {
                window.location.href = `detalle.html?id=${elegida.id}`;
            }
        });
    }
});