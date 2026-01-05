export function crearEstadoInicial(datos) {
	const primerGradoId = datos.grados[0]?.id ?? 1;
	return {
		gradoId: primerGradoId,
		filtroArea: "todas",
		busqueda: "",
		datos,
	};
}

export function obtenerMateriasAsignadas(estado) {
	const ids = estado.datos.asignacionesPorGrado[String(estado.gradoId)] ?? [];
	return ids
		.map((id) => estado.datos.materias.find((m) => m.id === id))
		.filter(Boolean);
}

export function obtenerMateriasDisponibles(estado) {
	const asignadas = new Set(
		estado.datos.asignacionesPorGrado[String(estado.gradoId)] ?? []
	);
	return estado.datos.materias.filter((m) => {
		const esDelAnio = Number(m.anioId) === Number(estado.gradoId);
		if (!esDelAnio) return false;
		return !asignadas.has(m.id);
	});
}

function normalizarTexto(texto) {
	return String(texto ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.trim()
		.replace(/\s+/g, " ");
}

function normalizarCodigo(texto) {
	return String(texto ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]/g, "");
}

export function aplicarFiltroYBusqueda(materias, filtroArea, busqueda) {
	const qNombre = normalizarTexto(busqueda);
	const qCodigo = normalizarCodigo(busqueda);
	return (materias ?? []).filter((m) => {
		if (filtroArea && filtroArea !== "todas" && m.area !== filtroArea)
			return false;
		if (!qNombre && !qCodigo) return true;
		const nombreOk = normalizarTexto(m?.nombre).includes(qNombre);
		const codigoOk = normalizarCodigo(m?.codigo).includes(qCodigo);
		return nombreOk || codigoOk;
	});
}

export function asignarMateria(estado, materiaId) {
	const clave = String(estado.gradoId);
	const actual = estado.datos.asignacionesPorGrado[clave] ?? [];
	if (actual.includes(materiaId)) return;
	estado.datos.asignacionesPorGrado[clave] = [...actual, materiaId];
}

export function quitarMateria(estado, materiaId) {
	const clave = String(estado.gradoId);
	const actual = estado.datos.asignacionesPorGrado[clave] ?? [];
	estado.datos.asignacionesPorGrado[clave] = actual.filter(
		(id) => id !== materiaId
	);
}

export function calcularTotales(estado) {
	const asignadas = obtenerMateriasAsignadas(estado);
	const totalMaterias = asignadas.length;
	return { totalMaterias };
}

export function evaluarEstadoPlan(estado) {
	const { totalMaterias } = calcularTotales(estado);
	if (totalMaterias === 0) return "incompleto";
	return "completo";
}
