import {
	apiObtenerCatalogoMaterias,
	apiObtenerGrados,
	apiObtenerMateriasAsignadasPorGrado,
	apiGuardarMateriasDeGrado,
} from "./api.js";

import { asignarMateria, crearEstadoInicial, quitarMateria } from "./estado.js";
import {
	obtenerRefs,
	marcarChipActivo,
	poblarSelectGrados,
	renderizar,
} from "./ui.js";

const refs = obtenerRefs();

const asignacionesServidor = {};

let estado = crearEstadoInicial({
	grados: [],
	materias: [],
	asignacionesPorGrado: {},
});

function normalizarTexto(s) {
	return String(s ?? "")
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.toLowerCase()
		.trim();
}

function inferirArea(materia) {
	const nombre = normalizarTexto(materia?.nombre ?? "");

	const AREA_POR_MATERIA = new Map([
		["matematica i", "exactas_naturales"],
		["matematica ii", "exactas_naturales"],
		["matematica iii", "exactas_naturales"],
		["matematica iv", "exactas_naturales"],
		["matematica v", "exactas_naturales"],

		["fisica i", "exactas_naturales"],
		["fisica ii", "exactas_naturales"],
		["fisica iii", "exactas_naturales"],
		["fisica iv", "exactas_naturales"],
		["fisica v", "exactas_naturales"],

		["quimica i", "exactas_naturales"],
		["quimica ii", "exactas_naturales"],
		["quimica iii", "exactas_naturales"],
		["quimica iv", "exactas_naturales"],
		["quimica v", "exactas_naturales"],

		["biologia i", "exactas_naturales"],
		["biologia ii", "exactas_naturales"],
		["biologia iii", "exactas_naturales"],
		["biologia iv", "exactas_naturales"],
		["biologia v", "exactas_naturales"],

		["lenguaje y literatura i", "sociales_humanidades"],
		["lenguaje y literatura ii", "sociales_humanidades"],
		["lenguaje y literatura iii", "sociales_humanidades"],
		["lenguaje y literatura iv", "sociales_humanidades"],
		["lenguaje y literatura v", "sociales_humanidades"],

		["historia general", "sociales_humanidades"],
		["historia ii", "sociales_humanidades"],
		["historia iii", "sociales_humanidades"],
		["historia iv", "sociales_humanidades"],
		["historia v", "sociales_humanidades"],

		["geografia i", "sociales_humanidades"],
		["geografia ii", "sociales_humanidades"],
		["geografia iii", "sociales_humanidades"],
		["geografia iv", "sociales_humanidades"],
		["geografia v", "sociales_humanidades"],

		["computacion i", "tecnologia_expresion"],
		["computacion ii", "tecnologia_expresion"],
		["computacion iii", "tecnologia_expresion"],
		["computacion iv", "tecnologia_expresion"],
		["computacion v", "tecnologia_expresion"],

		["dibujo i", "tecnologia_expresion"],
		["dibujo ii", "tecnologia_expresion"],
		["dibujo iii", "tecnologia_expresion"],
		["dibujo iv", "tecnologia_expresion"],
		["dibujo v", "tecnologia_expresion"],

		["ingles i", "idiomas_modernos"],
		["ingles ii", "idiomas_modernos"],
		["ingles iii", "idiomas_modernos"],
		["ingles iv", "idiomas_modernos"],
		["ingles v", "idiomas_modernos"],

		["deporte i", "educacion_fisica_salud"],
		["deporte ii", "educacion_fisica_salud"],
		["deporte iii", "educacion_fisica_salud"],
		["deporte iv", "educacion_fisica_salud"],
		["deporte v", "educacion_fisica_salud"],
	]);
	return AREA_POR_MATERIA.get(nombre) ?? "todas";
}

async function cargarAsignacionesDeGrado(gradoId) {
	const resp = await apiObtenerMateriasAsignadasPorGrado(gradoId);
	const ids = (resp.data ?? [])
		.map((m) => Number(m.subject_id ?? m.id))
		.filter(Boolean);
	const clave = String(gradoId);
	estado.datos.asignacionesPorGrado[clave] = ids;
	asignacionesServidor[clave] = structuredClone(ids);
}

async function iniciar() {
	const [gradosResp, materiasResp] = await Promise.all([
		apiObtenerGrados(),
		apiObtenerCatalogoMaterias(),
	]);
	const materiasRaw = materiasResp.data ?? [];
	const materias = materiasRaw.map((m) => ({
		...m,
		anioId: Number(m.anioId ?? m.grade_id ?? m.gradeId ?? 0) || null,
		area: m.area && m.area !== "todas" ? m.area : inferirArea(m),
	}));
	const datos = {
		grados: gradosResp.data ?? [],
		materias,
		asignacionesPorGrado: {},
	};
	estado = crearEstadoInicial(datos);
	poblarSelectGrados(refs.selectGrado, estado.datos.grados, estado.gradoId);
	marcarChipActivo(refs.contenedorChips, estado.filtroArea);
	await cargarAsignacionesDeGrado(estado.gradoId);
	renderizar(estado, refs);
}

iniciar().catch((e) => {
	alert(`No se pudo iniciar el módulo: ${e.message}`);
});

refs.selectGrado.addEventListener("change", async () => {
	estado.gradoId = Number(refs.selectGrado.value);
	const clave = String(estado.gradoId);
	if (!estado.datos.asignacionesPorGrado[clave]) {
		await cargarAsignacionesDeGrado(estado.gradoId);
	}
	renderizar(estado, refs);
});

refs.inputBuscar.addEventListener("input", () => {
	estado.busqueda = refs.inputBuscar.value ?? "";
	renderizar(estado, refs);
});

refs.contenedorChips.addEventListener("click", (e) => {
	const btn = e.target.closest("button[data-filtro]");
	if (!btn) return;
	estado.filtroArea = btn.dataset.filtro;
	marcarChipActivo(refs.contenedorChips, estado.filtroArea);
	renderizar(estado, refs);
});

refs.listaCatalogo.addEventListener("click", (e) => {
	const btn = e.target.closest("button[data-accion='agregar']");
	if (!btn) return;
	const item = e.target.closest(".item[data-id]");
	const id = Number(item?.dataset?.id);
	if (!id) return;
	asignarMateria(estado, id);
	renderizar(estado, refs);
});

refs.listaAsignadas.addEventListener("click", (e) => {
	const btn = e.target.closest("button[data-accion='quitar']");
	if (!btn) return;
	const item = e.target.closest(".item[data-id]");
	const id = Number(item?.dataset?.id);
	if (!id) return;
	quitarMateria(estado, id);
	renderizar(estado, refs);
});

refs.btnCancelar.addEventListener("click", () => {
	const clave = String(estado.gradoId);
	if (asignacionesServidor[clave]) {
		estado.datos.asignacionesPorGrado[clave] = structuredClone(
			asignacionesServidor[clave]
		);
	}
	refs.inputBuscar.value = "";
	estado.busqueda = "";
	estado.filtroArea = "todas";
	marcarChipActivo(refs.contenedorChips, estado.filtroArea);
	renderizar(estado, refs);
});

refs.btnGuardar.addEventListener("click", async () => {
	const clave = String(estado.gradoId);
	const ids = estado.datos.asignacionesPorGrado[clave] ?? [];
	try {
		await apiGuardarMateriasDeGrado(estado.gradoId, ids);
		asignacionesServidor[clave] = structuredClone(ids);
		alert(
			`Cambios guardados.\nAño académico seleccionado: ${estado.gradoId}\nMaterias asignadas: ${ids.length}`
		);
	} catch (e) {
		alert(`No se pudieron guardar los cambios: ${e.message}`);
	}
});
