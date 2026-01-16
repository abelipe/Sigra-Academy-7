import { db } from '../../../../database/db.database.mjs';

// Modelo que interactua con la tabla subject_prerequisites de la base de datos
export class ModelPrelacy {
	// Método para obtener todas las materias
	static async getAllSubjects() {
		const [subjects] = await db.query(
			`SELECT s.subject_id, s.code_subject AS code, s.subject_name AS name, s.is_active, 
            g.grade_name, g.level_order
			FROM subjects s JOIN grades g ON s.grade_id = g.grade_id WHERE s.is_active = 1 
			ORDER BY g.level_order, s.subject_name`
		);
		return subjects;
	}

	// Método para obtener una materia por su ID
	static async getSubjectById(subjectId) {
		if (!subjectId) return { error: 'El ID de la materia es requerido' };
		const [subject] = await db.query(
			`SELECT s.*, g.grade_name, g.level_order FROM subjects s JOIN grades g ON s.grade_id = g.grade_id 
			WHERE s.subject_id = ? LIMIT 1`, [subjectId]
		);
		// Verificar si se encontró la materia
		if (subject.length === 0) return { error: 'Materia no encontrada' };
		return {
			message: 'Materia obtenida correctamente',
			subject: subject[0]
		}
	}

	// Método para obtener todos las prelaturas
	static async getAllPrelacies() {
		const [prelacies] = await db.query(
			`SELECT sp.*, s1.code_subject AS subject_code, s1.subject_name, 
			s2.code_subject AS prereq_code, s2.subject_name AS prereq_name
			FROM subject_prerequisites sp
			JOIN subjects s1 ON sp.subject_id = s1.subject_id
			JOIN subjects s2 ON sp.subject_prerequisites_id = s2.subject_id
			ORDER BY s1.subject_name`
		);
		return prelacies;
	}

	// Método para obtener las prelaturas de una materia en especifico
	static async getPrelaciesBySubjectId(subjectId) {
		if (!subjectId) return { error: 'El ID de la materia es requerido' };
		// Se verifica si existe la materia
		const [existingSubject] = await db.query(
			`SELECT * FROM subjects WHERE subject_id = ?`,
			[subjectId]
		);
		if (existingSubject.length === 0) return { error: 'Materia no encontrada' };
		// Si existe, se obtienen sus prelaturas
		const [prelacies] = await db.query(
			`SELECT sp.id, sp.subject_id, sp.subject_prerequisites_id, s.code_subject,
			s.subject_name, g.grade_name, g.level_order FROM subject_prerequisites sp
			JOIN subjects s ON sp.subject_prerequisites_id = s.subject_id
			JOIN grades g ON s.grade_id = g.grade_id
			WHERE sp.subject_id = ? ORDER BY g.level_order, s.subject_name`,
			[subjectId]
		);
		if (prelacies.length === 0) return { error: 'No hay prelaturas registradas para esta materia' };
		return {
			message: 'Prelaturas obtenidas correctamente',
			prelacies: prelacies
		}
	}

	// Método para crear una prelatura
	static async createPrelacy(data) {
		if (!data) return { error: 'El ID de la materia y el ID de la prelatura son requeridos' };
		// Frontend sends prerequisite_id, map to subject_prerequisites_id
		const { subject_id, prerequisite_id, subject_prerequisites_id } = data;
		const prereqId = prerequisite_id || subject_prerequisites_id;

		// Se verifica si existe la materia y si existe la prelatura
		const [exisitingSubject] = await db.query(
			`SELECT * FROM subjects WHERE subject_id = ?`,
			[subject_id]
		);
		if (exisitingSubject.length === 0) {
			return { error: 'Materia no encontrada' };
		}

		// Check if prerequisite already exists
		if (prereqId) {
			const [existingPrerequisite] = await db.query(
				`SELECT * FROM subject_prerequisites WHERE subject_prerequisites_id = ? 
				AND subject_id = ?`,
				[prereqId, subject_id]
			);
			if (existingPrerequisite.length > 0) {
				return { error: 'Prelatura ya existe para esta materia' };
			}
		}

		// Si no existe, se crea la prelatura
		const [newPrelacy] = await db.query(
			`INSERT INTO subject_prerequisites (subject_id, subject_prerequisites_id)
			VALUES (?, ?)`,
			[subject_id, prereqId]
		);

		return {
			message: 'Prelatura creada correctamente',
			id: newPrelacy.insertId
		}
	}

	// Método para eliminar una prelatura
	static async deletePrelacy(prelacyId) {
		if (!prelacyId) return { error: 'El ID de la prelatura es requerido' };
		// Se verifica si existe la prelatura
		const [existingPrelacy] = await db.query(
			`SELECT * FROM subject_prerequisites WHERE id = ?`,
			[prelacyId]
		);
		if (existingPrelacy.length === 0) return { error: 'Prelatura no encontrada' };
		// Si existe, se elimina la prelatura
		const [deletedPrelacy] = await db.query(
			`DELETE FROM subject_prerequisites WHERE id = ?`,
			[prelacyId]
		);
		if (deletedPrelacy.affectedRows === 0) return { error: 'Error al eliminar la prelatura' };
		return {
			message: 'Prelatura eliminada correctamente'
		}
	}

	// Método para buscar materias por código o nombre
	static async searchSubjects(query) {
		if (!query) return { error: 'Se requiere un término de búsqueda' };
		const searchTerm = `%${query}%`;
		const [subjects] = await db.query(
			`SELECT s.subject_id, s.code_subject AS code, s.subject_name AS name, 
			g.grade_name, g.level_order 
			FROM subjects s 
			JOIN grades g ON s.grade_id = g.grade_id 
			WHERE s.is_active = 1 AND (s.code_subject LIKE ? OR s.subject_name LIKE ?)
			ORDER BY g.level_order, s.subject_name
			LIMIT 20`,
			[searchTerm, searchTerm]
		);
		return subjects;
	}

	// Método para obtener resumen de prelaciones (agrupadas por materia)
	static async getSummary() {
		const [rows] = await db.query(
			`SELECT 
				s1.subject_id,
				s1.code_subject AS subject_code,
				s1.subject_name,
				sp.id AS prelacy_id,
				sp.subject_prerequisites_id,
				s2.code_subject AS prereq_code,
				s2.subject_name AS prereq_name
			FROM subjects s1
			LEFT JOIN subject_prerequisites sp ON s1.subject_id = sp.subject_id
			LEFT JOIN subjects s2 ON sp.subject_prerequisites_id = s2.subject_id
			WHERE s1.is_active = 1
			HAVING sp.id IS NOT NULL
			ORDER BY s1.subject_name`
		);

		// Group by subject
		const map = new Map();
		rows.forEach(r => {
			const sid = r.subject_id;
			if (!map.has(sid)) {
				map.set(sid, {
					subject_id: r.subject_id,
					subject_code: r.subject_code,
					subject_name: r.subject_name,
					prereqs: [],
					hasNoPrereqs: false
				});
			}
			const entry = map.get(sid);
			if (r.prereq_code != null) {
				entry.prereqs.push({
					code: r.prereq_code,
					name: r.prereq_name,
					subject_prerequisites_id: r.subject_prerequisites_id
				});
			} else {
				entry.hasNoPrereqs = true;
			}
		});

		return Array.from(map.values());
	}

	// Método para eliminar todas las prelaciones de una materia específica
	static async deletePrelaciesBySubjectId(subjectId) {
		if (!subjectId) return { error: 'El ID de la materia es requerido' };
		// Verificar si existe la materia
		const [existingSubject] = await db.query(
			`SELECT * FROM subjects WHERE subject_id = ?`,
			[subjectId]
		);
		if (existingSubject.length === 0) return { error: 'Materia no encontrada' };

		// Eliminar todas las prelaciones de esa materia
		const [result] = await db.query(
			`DELETE FROM subject_prerequisites WHERE subject_id = ?`,
			[subjectId]
		);

		return {
			message: `${result.affectedRows} prelaciones eliminadas correctamente`,
			deletedCount: result.affectedRows
		};
	}
}

