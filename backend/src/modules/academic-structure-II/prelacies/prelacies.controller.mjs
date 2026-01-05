import {
	getAllSubjects,
	searchSubjects,
	getPrerequisitesForSubject,
	getPossiblePrerequisites,
	createPrerequisite,
	deletePrerequisite,
	deletePrerequisitesBySubject,
	getSubjectById,
	getAllPrerequisitesRows,
	getPrereqSummary
} from './prelacies.model.mjs';

export const listSubjects = async (req, res) => {
	try {
		// Allow client to include 5th year subjects by passing ?includeFifth=true
		const includeFifth = String(req.query.includeFifth || 'false') === 'true';
		const subjects = await getAllSubjects(!includeFifth);
		return res.status(200).json(subjects);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const search = async (req, res) => {
	try {
		const q = String(req.query.q || '').trim();
		if (!q) return res.status(400).json({ message: 'Query param q required' });
		const rows = await searchSubjects(q);
		return res.status(200).json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const getPrereqs = async (req, res) => {
	try {
		const subjectId = Number(req.params.subjectId);
		if (!subjectId) return res.status(400).json({ message: 'subjectId required' });

		const subject = await getSubjectById(subjectId);
		if (!subject) return res.status(404).json({ message: 'Subject not found' });

		const prereqs = await getPrerequisitesForSubject(subjectId);
		const possible = await getPossiblePrerequisites(subjectId);
		return res.status(200).json({ subject, prereqs, possible });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const create = async (req, res) => {
	try {
		const { subject_id, prerequisite_id } = req.body;
		if (!subject_id) return res.status(400).json({ message: 'subject_id required' });
		// prerequisite_id may be null to indicate "no prerequisites" (allowed for 1st year)
		try {
			const result = await createPrerequisite(subject_id, prerequisite_id === undefined ? null : prerequisite_id);
			return res.status(201).json({ id: result.insertId });
		} catch (err) {
			return res.status(400).json({ message: err.message });
		}
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const remove = async (req, res) => {
	try {
		const id = Number(req.params.id);
		if (!id) return res.status(400).json({ message: 'id required' });
		const ok = await deletePrerequisite(id);
		if (!ok) return res.status(404).json({ message: 'Prerequisite not found' });
		return res.status(200).json({ deleted: true });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const removeBySubject = async (req, res) => {
	try {
		const subjectId = Number(req.params.subjectId);
		if (!subjectId) return res.status(400).json({ message: 'subjectId required' });
		const count = await deletePrerequisitesBySubject(subjectId);
		return res.status(200).json({ deleted: true, count });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const allPrereqs = async (req, res) => {
	try {
		const rows = await getAllPrerequisitesRows();
		return res.status(200).json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

export const summary = async (req, res) => {
	try {
		const rows = await getPrereqSummary();
		return res.status(200).json(rows);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
}

