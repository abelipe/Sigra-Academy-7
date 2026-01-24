export class AssignmentController {
    constructor({ assignmentModel }) {
        this.assignmentModel = assignmentModel;
    }

    getUnassignedStudents = async (req, res) => {
        const { academicYearId } = req.params;
        try {
            const result = await this.assignmentModel.getUnassignedStudents(Number(academicYearId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener estudiantes no asignados' });
        }
    }

    getAssignedStudents = async (req, res) => {
        const { sectionId } = req.params;
        try {
            const result = await this.assignmentModel.getAssignedStudents(Number(sectionId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener estudiantes asignados' });
        }
    }

    getUnassignedTeachers = async (req, res) => {
        const { sectionId } = req.params;
        try {
            const result = await this.assignmentModel.getUnassignedTeachers(Number(sectionId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener profesores no asignados' });
        }
    }

    getAllTeachers = async (req, res) => {
        const { academicYearId } = req.query; // Optional query parameter
        try {
            const result = await this.assignmentModel.getAllTeachers(academicYearId ? Number(academicYearId) : null);
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error in getAllTeachers:', error);
            return res.status(500).json({ error: 'Error al obtener profesores' });
        }
    }

    getAssignedTeachers = async (req, res) => {
        const { sectionId } = req.params;
        try {
            const result = await this.assignmentModel.getAssignedTeachers(Number(sectionId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Error al obtener profesores asignados' });
        }
    }

    assignTeacher = async (req, res) => {
        try {
            const result = await this.assignmentModel.assignTeacher(req.body);
            if (result.error) return res.status(400).json({ error: result.error });
            return res.status(201).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Error al asignar profesor' });
        }
    }

    unassignTeacher = async (req, res) => {
        const { assignmentId } = req.params;
        try {
            const result = await this.assignmentModel.unassignTeacher(Number(assignmentId));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Error al desasignar profesor' });
        }
    }
}
