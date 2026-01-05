import {
	aplicarFiltroYBusqueda,
	calcularTotales,
	evaluarEstadoPlan,
	obtenerMateriasAsignadas,
	obtenerMateriasDisponibles,
} from "./estado.js";

function iconoMas() {
	return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
    </svg>
`;
}

function iconoPapelera() {
	return `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M6 7l1 14h10l1-14" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M9 7V4h6v3" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    </svg>
`;
}

function crearEtiquetaTipo(tipo) {
	if (tipo === "troncal") {
		return `<span class="etiqueta-pill etiqueta-pill--troncal">PRINCIPAL</span>`;
	}
	if (tipo === "complementaria") {
		return `<span class="etiqueta-pill etiqueta-pill--complementaria">COMPLEMENTARIA</span>`;
	}
	return "";
}

export function poblarSelectGrados(selectEl, grados, gradoIdActual) {
	selectEl.innerHTML = grados
		.map(
			(g) =>
				`<option value="${g.id}" ${
					g.id === gradoIdActual ? "selected" : ""
				}>${g.nombre}</option>`
		)
		.join("");
}

export function marcarChipActivo(contenedor, filtro) {
	const chips = Array.from(contenedor.querySelectorAll(".chip"));
	chips.forEach((ch) =>
		ch.classList.toggle("chip--activo", ch.dataset.filtro === filtro)
	);
}

export function renderizar(estado, refs) {
	const disponibles = obtenerMateriasDisponibles(estado);
	const asignadas = obtenerMateriasAsignadas(estado);
	const visibles = aplicarFiltroYBusqueda(
		disponibles,
		estado.filtroArea,
		estado.busqueda
	);
	renderizarResumen(estado, refs);
	renderizarCatalogo(visibles, refs);
	renderizarAsignadas(asignadas, refs);
	renderizarEstadoPlan(estado, refs);
}

function renderizarResumen(estado, refs) {
	const { totalMaterias } = calcularTotales(estado);
	refs.txtTotalMaterias.textContent = String(totalMaterias);
}

function renderizarCatalogo(materias, refs) {
	if (!materias.length) {
		refs.listaCatalogo.innerHTML = `
    <div class="item" style="justify-content:center; color:#64748b; font-weight:800;">
        No hay materias disponibles con este filtro.
    </div>
    `;
		return;
	}

	refs.listaCatalogo.innerHTML = materias
		.map((m) => {
			return `
    <article class="item" data-id="${m.id}">
    <div class="item__izq">
        <div class="sigla">${m.sigla ?? "MAT"}</div>
        <div class="item__texto">
        <div class="item__nombre">${m.nombre}</div>
        <div class="item__meta">Código: ${m.codigo}</div>
        </div>
    </div>

    <div class="item__acciones">
        <button class="boton-icono" type="button" data-accion="agregar" aria-label="Agregar materia">
        ${iconoMas()}
        </button>
    </div>
    </article>
`;
		})
		.join("");
}

function renderizarAsignadas(materias, refs) {
	if (!materias.length) {
		refs.listaAsignadas.innerHTML = `
    <div class="item item--asignada" style="justify-content:center; color:#64748b; font-weight:800;">
        Aún no hay materias asignadas a este año académico.
    </div>
    `;
		return;
	}

	refs.listaAsignadas.innerHTML = materias
		.map((m) => {
			return `
    <article class="item item--asignada" data-id="${m.id}">
    <div class="item__izq">
        <div class="sigla">${m.sigla ?? "MAT"}</div>
        <div class="item__texto">
        <div class="item__nombre">
            ${m.nombre}
            <span class="etiquetas">
            ${crearEtiquetaTipo(m.tipo)}
            </span>
        </div>
        <div class="item__meta">Código: ${m.codigo}</div>
        </div>
    </div>

    <div class="item__acciones">
        <button class="boton-icono boton-icono--peligro" type="button" data-accion="quitar" aria-label="Quitar materia">
        ${iconoPapelera()}
        </button>
    </div>
    </article>
`;
		})
		.join("");
}

function renderizarEstadoPlan(estado, refs) {
	const resultado = evaluarEstadoPlan(estado);
	refs.estadoPlan.classList.toggle(
		"estado-plan--incompleto",
		resultado === "incompleto"
	);
	if (resultado === "incompleto")
		refs.txtEstadoPlan.textContent = "Incompleto";
	else refs.txtEstadoPlan.textContent = "Completo";
}

export function obtenerRefs() {
	return {
		selectGrado: document.getElementById("selectGrado"),
		inputBuscar: document.getElementById("inputBuscar"),
		contenedorChips: document.querySelector(".filtros"),
		listaCatalogo: document.getElementById("listaCatalogo"),
		listaAsignadas: document.getElementById("listaAsignadas"),
		txtTotalMaterias: document.getElementById("txtTotalMaterias"),
		estadoPlan: document.getElementById("estadoPlan"),
		txtEstadoPlan: document.getElementById("txtEstadoPlan"),
		btnGuardar: document.getElementById("btnGuardar"),
		btnCancelar: document.getElementById("btnCancelar"),
	};
}
