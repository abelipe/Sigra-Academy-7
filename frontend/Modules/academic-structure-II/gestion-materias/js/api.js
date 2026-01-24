const BASE_URL = "http://localhost:3000/api";

console.log('[API] Módulo api.js cargado. BASE_URL:', BASE_URL);

async function request(path, options = {}) {
	const url = `${BASE_URL}${path}`;
	console.log('[API] Realizando petición a:', url);
	try {
		const res = await fetch(url, {
			headers: { "Content-Type": "application/json" },
			...options,
		});
		console.log('[API] Respuesta recibida:', res.status, res.statusText);
		const data = await res.json().catch(() => null);
		console.log('[API] Datos parseados:', data);
		if (!res.ok) {
			const mensaje = data?.mensaje || data?.message || `Error HTTP ${res.status}`;
			throw new Error(mensaje);
		}
		return data;
	} catch (error) {
		console.error('[API] Error en petición:', error);
		throw error;
	}
}

export async function apiObtenerGrados() {
	const response = await request(`/grades/all`, { method: "GET" });
	// Transformar la respuesta del backend al formato esperado por el frontend
	return {
		data: (response.data || response.grades || []).map(g => ({
			id: g.grade_id,
			nombre: g.grade_name
		}))
	};
}

export async function apiObtenerCatalogoMaterias() {
	const response = await request(`/subjects/all`, { method: "GET" });
	// Transformar la respuesta del backend al formato esperado por el frontend
	return {
		data: (response.subjects || []).map(m => ({
			id: m.subject_id,
			nombre: m.subject_name,
			codigo: m.code_subject,
			sigla: m.code_subject?.substring(0, 3) || "MAT",
			anioId: parseInt(m.anio?.replace(/[^0-9]/g, '')) || m.grade_id || null,
			area: m.area || "todas",
			tipo: m.is_active === 1 ? "troncal" : "complementaria"
		}))
	};
}

export async function apiObtenerMateriasAsignadasPorGrado(gradeId) {
	try {
		const response = await request(`/subjects/grade/${gradeId}`, { method: "GET" });
		const assignedSubjects = response.subjects || [];
		return {
			data: assignedSubjects.map(m => ({
				subject_id: m.subject_id,
				id: m.subject_id
			}))
		};
	} catch (error) {
		console.warn('Error al obtener materias asignadas, retornando array vacío:', error);
		return { data: [] };
	}
}


export async function apiGuardarMateriasDeGrado(gradeId, subjectIds) {
	try {
		const response = await request('/subjects/assign-to-grade', {
			method: 'POST',
			body: JSON.stringify({
				gradeId: parseInt(gradeId),
				subjectIds: subjectIds.map(id => parseInt(id))
			})
		});
		return {
			success: true,
			message: response.message || 'Cambios guardados correctamente',
			data: response
		};
	} catch (error) {
		console.error('Error al guardar materias:', error);
		throw new Error(error.message || 'No se pudieron guardar los cambios');
	}
}
