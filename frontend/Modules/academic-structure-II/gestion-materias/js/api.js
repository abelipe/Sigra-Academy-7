const BASE_URL = "http://localhost:4300/api/management";

async function request(path, options = {}) {
	const res = await fetch(`${BASE_URL}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	const data = await res.json().catch(() => null);
	if (!res.ok) {
		const mensaje = data?.mensaje || `Error HTTP ${res.status}`;
		throw new Error(mensaje);
	}
	return data;
}

export async function apiObtenerGrados() {
	return request(`/grados`, { method: "GET" });
}

export async function apiObtenerCatalogoMaterias() {
	return request(`/materias`, { method: "GET" });
}

export async function apiObtenerMateriasAsignadasPorGrado(gradeId) {
	return request(`/grados/${gradeId}/materias`, { method: "GET" });
}

export async function apiGuardarMateriasDeGrado(gradeId, subjectIds) {
	return request(`/grados/${gradeId}/materias`, {
		method: "PUT",
		body: JSON.stringify({ subjectIds }),
	});
}
