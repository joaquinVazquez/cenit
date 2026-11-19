import { reflexiones } from "../datos.js";
import { obtenerFechaHoy, obtenerPublicadas, filtrarReflexiones } from "./utils.js";
import { renderizarDestacada, renderizarGrid, renderizarContador } from "./render.js";

document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById("featured-container");
    const gridContainer = document.getElementById("grid-container");
    const inputBuscador = document.getElementById("buscador");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const contadorResultados = document.getElementById("contador-resultados");

    const fechaHoy = obtenerFechaHoy();
    const publicadas = obtenerPublicadas(reflexiones, fechaHoy);

    if (!publicadas.length) return;

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
});