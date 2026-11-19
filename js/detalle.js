import { reflexiones } from "../datos.js";
import { extraerResumen, calcularTiempoLectura } from "./utils.js";

/**
 * Actualiza <title> y <meta name="description"> dinámicamente
 */
function actualizarSEO(data) {
    if (!data) {
        document.title = "Reflexión no encontrada — Cénit Mental";
        return;
    }

    const autorTexto = data.autor ? ` (${data.autor})` : "";
    document.title = `${data.titulo}${autorTexto} | Cénit Mental`;

    const resumenSEO = extraerResumen(data.texto, 155) || `"${data.cita}" — ${data.autor || "Cénit Mental"}`;
    let metaDesc = document.querySelector('meta[name="description"]');

    if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = resumenSEO;
}

function inicializarBarraProgreso(progressIndicator) {
    if (!progressIndicator) return;

    window.addEventListener("scroll", () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        if (scrollHeight > 0) {
            const porcentaje = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
            progressIndicator.style.width = `${porcentaje}%`;
        } else {
            progressIndicator.style.width = "100%";
        }
    }, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const data = Array.isArray(reflexiones)
        ? reflexiones.find((item) => item.id === id)
        : null;

    const fullTextEl = document.getElementById("full-text");
    const readingTimeEl = document.getElementById("reading-time");
    const progressIndicator = document.getElementById("progress-indicator");

    actualizarSEO(data);

    if (data) {
        document.getElementById("title").textContent = data.titulo;

        const imgEl = document.getElementById("image");
        imgEl.src = data.imagen;
        imgEl.alt = data.titulo;

        document.getElementById("quote").textContent = `"${data.cita}"`;
        document.getElementById("author").textContent = data.autor || "";
        fullTextEl.innerHTML = data.texto;

        const minutos = calcularTiempoLectura(fullTextEl.innerText);
        if (minutos > 0 && readingTimeEl) {
            readingTimeEl.textContent = `${minutos} min de lectura`;
            readingTimeEl.hidden = false;
        }
    } else {
        document.getElementById("title").textContent = "Reflexión no encontrada";
        document.getElementById("image").style.display = "none";
    }

    inicializarBarraProgreso(progressIndicator);
});