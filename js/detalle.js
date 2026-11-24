import { reflexiones } from "../datos.js";
import {
    extraerResumen,
    calcularTiempoLectura,
    obtenerNavegacionReflexion,
    formatearCitaParaCompartir,
    construirUrlWhatsApp,
    esReflexionLeida,
    alternarReflexionLeida,
    aplicarImagenConRespaldo
} from "./utils.js";

const STORAGE_KEY_TAMANO_FUENTE = "cenit_tamano_fuente_v1";
const ESCALAS_FUENTE = [0.9, 1, 1.1, 1.2, 1.3];
const ESCALA_POR_DEFECTO = 1;

function obtenerEscalaGuardada() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_TAMANO_FUENTE);
        const valor = Number.parseFloat(raw);
        return ESCALAS_FUENTE.includes(valor) ? valor : ESCALA_POR_DEFECTO;
    } catch {
        return ESCALA_POR_DEFECTO;
    }
}

function guardarEscalaFuente(escala) {
    try {
        localStorage.setItem(STORAGE_KEY_TAMANO_FUENTE, String(escala));
    } catch (error) {
        console.warn("No se pudo guardar el tamaño de fuente:", error);
    }
}

function aplicarEscalaFuente(fullTextEl, escala) {
    if (!fullTextEl) return;

    const tamanoBaseRem = 1.05;
    fullTextEl.style.fontSize = `${(tamanoBaseRem * escala).toFixed(3)}rem`;

    fullTextEl.querySelectorAll("p").forEach((parrafo) => {
        parrafo.style.fontSize = "inherit";
    });
}

function inicializarTamanoFuente(fullTextEl) {
    const btnDecrease = document.getElementById("btn-font-decrease");
    const btnIncrease = document.getElementById("btn-font-increase");
    const btnReset = document.getElementById("btn-font-reset");

    if (!fullTextEl || !btnDecrease || !btnIncrease || !btnReset) return;

    let escalaActual = obtenerEscalaGuardada();

    function actualizarControles() {
        const indice = ESCALAS_FUENTE.indexOf(escalaActual);
        const porcentaje = Math.round(escalaActual * 100);

        aplicarEscalaFuente(fullTextEl, escalaActual);

        btnReset.textContent = `${porcentaje}%`;
        btnDecrease.disabled = indice <= 0;
        btnIncrease.disabled = indice >= ESCALAS_FUENTE.length - 1;
    }

    actualizarControles();

    btnDecrease.addEventListener("click", () => {
        const indice = ESCALAS_FUENTE.indexOf(escalaActual);
        if (indice > 0) {
            escalaActual = ESCALAS_FUENTE[indice - 1];
            guardarEscalaFuente(escalaActual);
            actualizarControles();
        }
    });

    btnIncrease.addEventListener("click", () => {
        const indice = ESCALAS_FUENTE.indexOf(escalaActual);
        if (indice < ESCALAS_FUENTE.length - 1) {
            escalaActual = ESCALAS_FUENTE[indice + 1];
            guardarEscalaFuente(escalaActual);
            actualizarControles();
        }
    });

    btnReset.addEventListener("click", () => {
        escalaActual = ESCALA_POR_DEFECTO;
        guardarEscalaFuente(escalaActual);
        actualizarControles();
        mostrarToast("Tamaño de texto restablecido (100%)");
    });
}

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

function sincronizarBotonLectura(btn, leida) {
    btn.setAttribute("aria-pressed", String(leida));
    btn.classList.toggle("is-leida", leida);
    btn.textContent = leida ? "Leída" : "Marcar como leída";
}

function inicializarMarcadorLectura(reflexionId) {
    const btn = document.getElementById("btn-marcar-leida");
    if (!btn || !reflexionId) return;

    sincronizarBotonLectura(btn, esReflexionLeida(reflexionId));

    btn.addEventListener("click", () => {
        const nuevoEstado = alternarReflexionLeida(reflexionId);
        sincronizarBotonLectura(btn, nuevoEstado);
        mostrarToast(
            nuevoEstado
                ? "Reflexión marcada como leída"
                : "Marcador de lectura retirado"
        );
    });
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
        aplicarImagenConRespaldo(imgEl, data.imagen, data.titulo, { lazy: false });

        document.getElementById("quote").textContent = `"${data.cita}"`;
        document.getElementById("author").textContent = data.autor || "";
        fullTextEl.innerHTML = data.texto;

        const minutos = calcularTiempoLectura(fullTextEl.innerText);
        if (minutos > 0 && readingTimeEl) {
            readingTimeEl.textContent = `${minutos} min de lectura`;
            readingTimeEl.hidden = false;
        }

        inicializarTamanoFuente(fullTextEl);
        inicializarMarcadorLectura(data.id);
        inicializarNavegacion(data.id);
    } else {
        document.getElementById("title").textContent = "Reflexión no encontrada";
        const imgEl = document.getElementById("image");
        if (imgEl) imgEl.style.display = "none";

        const btnLectura = document.getElementById("btn-marcar-leida");
        if (btnLectura) btnLectura.hidden = true;
    }

    inicializarBarraProgreso(progressIndicator);
    inicializarCompartir(data);
});

function inicializarNavegacion(idActual) {
    const { anterior, siguiente } = obtenerNavegacionReflexion(reflexiones, idActual);

    const prevLink = document.getElementById("nav-prev");
    const prevTitle = document.getElementById("nav-prev-title");
    const nextLink = document.getElementById("nav-next");
    const nextTitle = document.getElementById("nav-next-title");

    if (anterior && prevLink && prevTitle) {
        prevLink.href = `detalle.html?id=${encodeURIComponent(anterior.id)}`;
        prevTitle.textContent = anterior.titulo;
        prevLink.hidden = false;
    }

    if (siguiente && nextLink && nextTitle) {
        nextLink.href = `detalle.html?id=${encodeURIComponent(siguiente.id)}`;
        nextTitle.textContent = siguiente.titulo;
        nextLink.hidden = false;
    }

    // Navegación rápida con flechas del teclado (← / →)
    document.addEventListener("keydown", (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.key === "ArrowLeft" && anterior) {
            window.location.href = `detalle.html?id=${encodeURIComponent(anterior.id)}`;
        } else if (e.key === "ArrowRight" && siguiente) {
            window.location.href = `detalle.html?id=${encodeURIComponent(siguiente.id)}`;
        }
    });
}

let toastTimeout = null;

function mostrarToast(mensaje) {
    const toast = document.getElementById("toast-notificacion");
    if (!toast) return;

    toast.textContent = mensaje;
    toast.hidden = false;

    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => {
            toast.hidden = true;
        }, 250);
    }, 2400);
}

async function copiarTextoAlPortapapeles(texto) {
    if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
        return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = texto;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copiado = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copiado;
}

function inicializarCompartir(data) {
    if (!data) return;

    const btnCopiar = document.getElementById("btn-copiar-cita");
    const btnCompartir = document.getElementById("btn-compartir");
    const urlActual = window.location.href;

    if (btnCopiar) {
        btnCopiar.addEventListener("click", async () => {
            const textoCita = formatearCitaParaCompartir(data.cita, data.autor);
            try {
                await copiarTextoAlPortapapeles(textoCita);
                mostrarToast("Cita copiada al portapapeles");
            } catch {
                mostrarToast("No se pudo copiar automáticamente");
            }
        });
    }

    if (btnCompartir) {
        btnCompartir.addEventListener("click", async () => {
            const textoCompartir = `${data.titulo} — ${formatearCitaParaCompartir(data.cita, data.autor)}`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: `${data.titulo} | Cénit Mental`,
                        text: textoCompartir,
                        url: urlActual
                    });
                    return;
                } catch (err) {
                    if (err && err.name === "AbortError") return;
                }
            }

            const whatsappUrl = construirUrlWhatsApp(data.titulo, urlActual);
            window.open(whatsappUrl, "_blank", "noopener,noreferrer");
            mostrarToast("Abriendo WhatsApp para compartir");
        });
    }
}