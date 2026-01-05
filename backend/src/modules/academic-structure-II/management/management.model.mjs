import { db } from "../../../../database/db.database.mjs";

export const obtenerMateriasPorGrado = async (gradeId) => {
	const sql = `
    SELECT s.*
    FROM subjects s
    INNER JOIN grado_materia gm ON gm.subject_id = s.subject_id
    WHERE gm.grade_id = ?
    ORDER BY s.subject_id ASC
`;
	const [rows] = await db.query(sql, [gradeId]);
	return rows;
};

export const asignarMateriaAGrado = async (gradeId, subjectId) => {
	const sql = `
    INSERT INTO grado_materia (grade_id, subject_id)
    VALUES (?, ?)
`;
	const [result] = await db.query(sql, [gradeId, subjectId]);
	return result;
};

export const asignarMateriasAGradoMasivo = async (gradeId, subjectIds) => {
	const values = subjectIds.map((sid) => [gradeId, sid]);
	const sql = `
    INSERT IGNORE INTO grado_materia (grade_id, subject_id)
    VALUES ?
`;
	const [result] = await db.query(sql, [values]);
	return result;
};

export const desasignarMateriaDeGrado = async (gradeId, subjectId) => {
	const sql = `
    DELETE FROM grado_materia
    WHERE grade_id = ? AND subject_id = ?
`;
	const [result] = await db.query(sql, [gradeId, subjectId]);
	return result;
};

export const existeRelacionGradoMateria = async (gradeId, subjectId) => {
	const sql = `
    SELECT 1 AS existe
    FROM grado_materia
    WHERE grade_id = ? AND subject_id = ?
    LIMIT 1
`;
	const [rows] = await db.query(sql, [gradeId, subjectId]);
	return rows.length > 0;
};

export const reemplazarMateriasDeGrado = async (gradeId, subjectIds) => {
	if (typeof db.getConnection === "function") {
		const conn = await db.getConnection();
		try {
			await conn.beginTransaction();
			await conn.query(`DELETE FROM grado_materia WHERE grade_id = ?`, [
				gradeId,
			]);
			if (subjectIds.length > 0) {
				const values = subjectIds.map((sid) => [gradeId, sid]);
				await conn.query(
					`INSERT IGNORE INTO grado_materia (grade_id, subject_id) VALUES ?`,
					[values]
				);
			}
			await conn.commit();
			return { ok: true };
		} catch (e) {
			await conn.rollback();
			throw e;
		} finally {
			conn.release();
		}
	}

	await db.query(`DELETE FROM grado_materia WHERE grade_id = ?`, [gradeId]);
	if (subjectIds.length > 0) {
		const values = subjectIds.map((sid) => [gradeId, sid]);
		await db.query(
			`INSERT IGNORE INTO grado_materia (grade_id, subject_id) VALUES ?`,
			[values]
		);
	}
	return { ok: true };
};

export const listarGrados = async () => {
	const sql = `
    SELECT grade_id, grade_name, level_order
    FROM grades
    ORDER BY level_order ASC
`;
	const [rows] = await db.query(sql);
	return rows;
};

export const listarMateriasCatalogo = async () => {
	const sql = `
    SELECT subject_id, grade_id, subject_name, code_subject, is_active, description
    FROM subjects
    WHERE is_active = TRUE
    ORDER BY grade_id ASC, subject_name ASC
`;
	const [rows] = await db.query(sql);
	return rows;
};
