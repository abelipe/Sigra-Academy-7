import {
	obtenerMateriasPorGrado,
	asignarMateriaAGrado,
	asignarMateriasAGradoMasivo,
	desasignarMateriaDeGrado,
	existeRelacionGradoMateria,
} from "./management.model.mjs";

import { validarId, validarListaIds } from "./management.schema.mjs";
import { reemplazarMateriasDeGrado } from "./management.model.mjs";
import { listarGrados, listarMateriasCatalogo } from "./management.model.mjs";

export const ctrlObtenerMateriasPorGrado = async (req, res, next) => {
	try {
		const gradeId = validarId(req.params.gradeId, "gradeId");
		const materias = await obtenerMateriasPorGrado(gradeId);
		return res.status(200).json({
			ok: true,
			mensaje: "Materias obtenidas correctamente.",
			data: materias,
		});
	} catch (error) {
		next(error);
	}
};

export const ctrlAsignarMateriaAGrado = async (req, res, next) => {
	try {
		const gradeId = validarId(req.params.gradeId, "gradeId");
		const subjectId = validarId(req.params.subjectId, "subjectId");
		const yaExiste = await existeRelacionGradoMateria(gradeId, subjectId);
		if (yaExiste) {
			return res.status(409).json({
				ok: false,
				mensaje: "La materia ya está asignada a este grado.",
			});
		}
		await asignarMateriaAGrado(gradeId, subjectId);
		return res.status(201).json({
			ok: true,
			mensaje: "Materia asignada al grado correctamente.",
		});
	} catch (error) {
		next(error);
	}
};

export const ctrlAsignacionMasiva = async (req, res, next) => {
	try {
		const gradeId = validarId(req.params.gradeId, "gradeId");
		const subjectIds = validarListaIds(req.body?.subjectIds, "subjectIds");
		const result = await asignarMateriasAGradoMasivo(gradeId, subjectIds);
		return res.status(201).json({
			ok: true,
			mensaje: "Asignación masiva completada correctamente.",
			data: {
				insertados: result?.affectedRows ?? null,
			},
		});
	} catch (error) {
		next(error);
	}
};

export const ctrlDesasignarMateriaDeGrado = async (req, res, next) => {
	try {
		const gradeId = validarId(req.params.gradeId, "gradeId");
		const subjectId = validarId(req.params.subjectId, "subjectId");
		const result = await desasignarMateriaDeGrado(gradeId, subjectId);
		if (!result || result.affectedRows === 0) {
			return res.status(404).json({
				ok: false,
				mensaje: "No existe esa asignación (grado-materia).",
			});
		}
		return res.status(200).json({
			ok: true,
			mensaje: "Materia desasignada del grado correctamente.",
		});
	} catch (error) {
		next(error);
	}
};

export const ctrlReemplazarMateriasDeGrado = async (req, res, next) => {
	try {
		const gradeId = validarId(req.params.gradeId, "gradeId");
		const subjectIds = validarListaIds(
			req.body?.subjectIds ?? [],
			"subjectIds",
			{
				allowEmpty: true,
			}
		);
		await reemplazarMateriasDeGrado(gradeId, subjectIds);
		return res.status(200).json({
			ok: true,
			mensaje: "Asignaciones actualizadas correctamente.",
		});
	} catch (error) {
		next(error);
	}
};

export const ctrlListarGrados = async (req, res, next) => {
	try {
		const rows = await listarGrados();
		const grados = rows.map((g) => ({
			id: Number(g.grade_id),
			nombre: g.grade_name,
		}));
		return res.status(200).json({
			ok: true,
			mensaje: "Grados obtenidos correctamente.",
			data: grados,
		});
	} catch (error) {
		next(error);
	}
};

export const ctrlListarMateriasCatalogo = async (req, res, next) => {
	try {
		const rows = await listarMateriasCatalogo();
		const materias = rows.map((m) => ({
			id: Number(m.subject_id),
			anioId: Number(m.grade_id),
			nombre: m.subject_name,
			codigo: m.code_subject,
			sigla:
				String(m.code_subject ?? "")
					.slice(0, 3)
					.toUpperCase() || "MAT",
			area: "todas",
			tipo: null,
			descripcion: m.description ?? null,
		}));
		return res.status(200).json({
			ok: true,
			mensaje: "Catálogo de materias obtenido correctamente.",
			data: materias,
		});
	} catch (error) {
		next(error);
	}
};
