import { db } from '../../../../database/db.database.mjs';

export const getAllSubjects = async (excludeFifth = true) => {
	const maxLevel = excludeFifth ? 4 : 999;
	const sql = `SELECT s.subject_id, s.code_subject as code, s.subject_name as name, g.grade_id, g.grade_name, g.level_order
							 FROM subjects s
							 JOIN grades g ON s.grade_id = g.grade_id
							 WHERE g.level_order <= ? AND s.is_active = 1
							 ORDER BY g.level_order, s.subject_name`;
	const [rows] = await db.execute(sql, [maxLevel]);
	return rows;
}

export const getSubjectById = async (id) => {
	const sql = `SELECT s.subject_id, s.code_subject as code, s.subject_name as name, g.grade_id, g.grade_name, g.level_order
							 FROM subjects s
							 JOIN grades g ON s.grade_id = g.grade_id
							 WHERE s.subject_id = ? LIMIT 1`;
	const [rows] = await db.execute(sql, [id]);
	return rows[0];
}

export const searchSubjects = async (q) => {
	const like = `%${q}%`;
	const sql = `SELECT s.subject_id, s.code_subject as code, s.subject_name as name, g.grade_id, g.grade_name, g.level_order
							 FROM subjects s
							 JOIN grades g ON s.grade_id = g.grade_id
							 WHERE (s.code_subject LIKE ? OR s.subject_name LIKE ?) AND s.is_active = 1
							 ORDER BY g.level_order, s.subject_name`;
	const [rows] = await db.execute(sql, [like, like]);
	return rows;
}

export const getPrerequisitesForSubject = async (subjectId) => {
	const sql = `SELECT sp.id, sp.subject_id, sp.subject_prerequisites_id, s2.code_subject as code, s2.subject_name as name, g.grade_name, g.level_order
							 FROM subject_prerequisites sp
							 JOIN subjects s2 ON sp.subject_prerequisites_id = s2.subject_id
							 JOIN grades g ON s2.grade_id = g.grade_id
							 WHERE sp.subject_id = ?`;
	const [rows] = await db.execute(sql, [subjectId]);
	return rows;
}

export const getPossiblePrerequisites = async (subjectId) => {
	// Return subjects with level_order < subject.level_order and up to 4th year
	const subject = await getSubjectById(subjectId);
	if (!subject) return [];
	const maxLevel = 4;
	const sql = `SELECT s.subject_id, s.code_subject as code, s.subject_name as name, g.grade_id, g.grade_name, g.level_order
							 FROM subjects s
							 JOIN grades g ON s.grade_id = g.grade_id
							 WHERE g.level_order < ? AND g.level_order <= ? AND s.is_active = 1
							 ORDER BY g.level_order, s.subject_name`;
	const [rows] = await db.execute(sql, [subject.level_order, maxLevel]);
	return rows;
}

export const createPrerequisite = async (subjectId, prerequisiteId) => {
	// Allow prerequisiteId === null to indicate "no prerequisites".
	// Avoid self-reference when prerequisiteId provided
	if (prerequisiteId !== null && Number(subjectId) === Number(prerequisiteId)) throw new Error('A subject cannot be prerequisite of itself');

	// Get subject record
	const subject = await getSubjectById(subjectId);
	if (!subject) throw new Error('Subject not found');

	// If prerequisiteId is null, only allow when subject is 1st year (level_order === 1)
	if (prerequisiteId === null) {
		if (!subject.level_order || Number(subject.level_order) !== 1) throw new Error('Only 1st year subjects can be saved without prerequisites');
		// Insert placeholder row with NULL prerequisite
		const [result] = await db.execute(
			`INSERT INTO subject_prerequisites (subject_id, subject_prerequisites_id) VALUES (?, NULL)`,
			[subjectId]
		);
		return { insertId: result.insertId };
	}

	// If prerequisiteId provided, validate it
	const prereq = await getSubjectById(prerequisiteId);
	if (!prereq) throw new Error('Prerequisite subject not found');
	if (prereq.level_order >= subject.level_order) throw new Error('Prerequisite must be from a lower year than the subject');

	// Check duplicates
	const [exists] = await db.execute(
		`SELECT id FROM subject_prerequisites WHERE subject_id = ? AND subject_prerequisites_id = ? LIMIT 1`,
		[subjectId, prerequisiteId]
	);
	if (exists.length) throw new Error('Prerequisite already exists');

	const [result] = await db.execute(
		`INSERT INTO subject_prerequisites (subject_id, subject_prerequisites_id) VALUES (?,?)`,
		[subjectId, prerequisiteId]
	);
	return { insertId: result.insertId };
}

export const deletePrerequisite = async (id) => {
	const [result] = await db.execute(`DELETE FROM subject_prerequisites WHERE id = ?`, [id]);
	return result.affectedRows > 0;
}

export const deletePrerequisitesBySubject = async (subjectId) => {
	const [result] = await db.execute(`DELETE FROM subject_prerequisites WHERE subject_id = ?`, [subjectId]);
	return result.affectedRows;
}

export const getAllPrerequisitesRows = async () => {
	// Use LEFT JOIN for prereq subject so rows with NULL subject_prerequisites_id are included
	const sql = `SELECT sp.id, sp.subject_id, sp.subject_prerequisites_id, sp.created_at,
											s.code_subject as subject_code, s.subject_name as subject_name,
											p.code_subject as prereq_code, p.subject_name as prereq_name
							 FROM subject_prerequisites sp
							 JOIN subjects s ON sp.subject_id = s.subject_id
							 LEFT JOIN subjects p ON sp.subject_prerequisites_id = p.subject_id
							 ORDER BY sp.created_at DESC`;
	const [rows] = await db.execute(sql);
	return rows;
}

export const getPrereqSummary = async () => {
	// Return subjects that have at least one row in subject_prerequisites (including NULL prereq)
	const sql = `SELECT s.subject_id, s.code_subject as subject_code, s.subject_name as subject_name,
											GROUP_CONCAT(CONCAT(p.code_subject, '::', p.subject_name) SEPARATOR '||') as prereqs,
											COUNT(sp.id) as prereq_count
							 FROM subjects s
							 LEFT JOIN subject_prerequisites sp ON s.subject_id = sp.subject_id
							 LEFT JOIN subjects p ON sp.subject_prerequisites_id = p.subject_id
							 GROUP BY s.subject_id
							 HAVING prereq_count > 0`;
	const [rows] = await db.execute(sql);
	// convert prereqs string to array; if prereqs is null but prereq_count>0 it means there are placeholder NULL prereqs
	return rows.map(r => ({
		subject_id: r.subject_id,
		subject_code: r.subject_code,
		subject_name: r.subject_name,
		prereqs: r.prereqs ? r.prereqs.split('||').map(x => {
			const [code, name] = x.split('::'); return { code, name };
		}) : [],
		hasNoPrereqs: (!r.prereqs || r.prereqs === '') && Number(r.prereq_count) > 0
	}));
}

