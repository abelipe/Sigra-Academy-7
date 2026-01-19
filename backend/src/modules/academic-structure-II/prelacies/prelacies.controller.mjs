import { validateCreatePrelacy } from "./prelacies.schema.mjs";
// Controlador para las prelaturas o prerelacias de las materias
export class PrelaciesController {
	constructor({ ModelPrelacy }) {
		this.model = ModelPrelacy;
	}

	getAllSubjects = async (req, res) => {
		try {
			const subjects = await this.model.getAllSubjects();
			// subjects is now an array, if error it would be thrown or handled differently if I changed model to throw
			// But model now returns array. If error in query, it throws.
			return res.status(200).json(subjects);
		}
		catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para obtener una materia por su ID ( ya existe en su respectivo modelo)
	getSubjectById = async (req, res) => {
		const { subjectId } = req.params;
		try {
			const result = await this.model.getSubjectById(subjectId);
			if (result.error) return res.status(404).json({ error: result.error });
			return res.status(200).json({
				message: result.message,
				subject: result.subject
			});
		}
		catch (error) {
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	getAllPrelacies = async (req, res) => {
		try {
			const prelacies = await this.model.getAllPrelacies();
			return res.status(200).json(prelacies);
		}
		catch (error) {
			console.error(error);
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para obtener las prelaturas de una materia en especifico
	getPrelaciesBySubjectId = async (req, res) => {
		const { subjectId } = req.params;
		try {
			// Get the subject info
			const subjectResult = await this.model.getSubjectById(subjectId);
			if (subjectResult.error) return res.status(404).json({ error: subjectResult.error });

			const subject = {
				subject_id: subjectResult.subject.subject_id,
				code: subjectResult.subject.code_subject,
				name: subjectResult.subject.subject_name,
				grade_name: subjectResult.subject.grade_name,
				level_order: subjectResult.subject.level_order
			};

			// Get current prerequisites for this subject
			const prelaciesResult = await this.model.getPrelaciesBySubjectId(subjectId);
			const prereqs = prelaciesResult.error ? [] : prelaciesResult.prelacies.map(p => ({
				id: p.id || p.prelacy_id,
				subject_prerequisites_id: p.subject_prerequisites_id,
				code: p.code_subject,
				name: p.subject_name,
				grade_name: p.grade_name
			}));

			// Get possible prerequisites (subjects from lower grades)
			const allSubjects = await this.model.getAllSubjects();
			const possible = Array.isArray(allSubjects)
				? allSubjects.filter(s =>
					s.level_order < subject.level_order &&
					s.subject_id !== parseInt(subjectId)
				).map(s => ({
					subject_id: s.subject_id,
					code: s.code,
					name: s.name,
					grade_name: s.grade_name
				}))
				: [];

			return res.status(200).json({
				subject,
				prereqs,
				possible
			});
		}
		catch (error) {
			console.error('Get prereqs error:', error);
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para crear una prelatura
	createPrelacy = async (req, res) => {
		const validation = validateCreatePrelacy(req.body);
		try {
			if (!validation.success) {
				return res.status(400).json({
					error: 'Datos inválidos',
					details: validation.error
				})
			}
			const result = await this.model.createPrelacy(validation.data);
			if (result.error) return res.status(400).json({ error: result.error });
			return res.status(201).json({
				message: result.message,
				id: result.id
			});
		}
		catch (error) {
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para eliminar una prelatura
	deletePrelacy = async (req, res) => {
		const { prelacyId } = req.params;
		try {
			const result = await this.model.deletePrelacy(prelacyId);
			if (result.error) return res.status(404).json({ error: result.error });
			return res.status(200).json({
				message: result.message
			});
		}
		catch (error) {
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para buscar materias
	searchSubjects = async (req, res) => {
		const { q } = req.query;
		try {
			const subjects = await this.model.searchSubjects(q);
			if (subjects.error) return res.status(400).json({ error: subjects.error });
			return res.status(200).json(subjects);
		}
		catch (error) {
			console.error('Search error:', error);
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para obtener resumen de prelaciones
	getSummary = async (req, res) => {
		try {
			const summary = await this.model.getSummary();
			return res.status(200).json(summary);
		}
		catch (error) {
			console.error('Summary error:', error);
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}

	// Controlador para eliminar todas las prelaciones de una materia
	deletePrelaciesBySubject = async (req, res) => {
		const { subjectId } = req.params;
		try {
			const result = await this.model.deletePrelaciesBySubjectId(subjectId);
			if (result.error) return res.status(404).json({ error: result.error });
			return res.status(200).json({
				message: result.message,
				deletedCount: result.deletedCount
			});
		}
		catch (error) {
			console.error('Delete by subject error:', error);
			return res.status(500).json({ error: 'Error del servidor' });
		}
	}
}

