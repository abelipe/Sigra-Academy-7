import { validateCreateSubject, validateUpdateSubject } from "./subjects.schema.mjs"

export class subjectController {
    constructor({ subjectModel }) {
        this.model = subjectModel
    }
    // controlador para obtener todas las materias
    getAllSubjects = async (req, res) => {
        try {
            const result = await this.model.getAllSubjects()
            if (result.error) return res.status(404).json({ error: result.error })
            return res.status(200).json({
                message: result.message,
                subjects: result.subjects
            })
        }
        catch (error) {
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para obtener una materia por su ID
    getSubjectById = async (req, res) => {
        const { subjectId } = req.params
        try {
            const result = await this.model.getSubjectById(subjectId)
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                subject: result.subject
            });
        }
        catch (error) {
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para obtener materias por grado
    getSubjectsByGrade = async (req, res) => {
        const { gradeId } = req.params
        try {
            const result = await this.model.getSubjectsByGrade(gradeId)
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                subjects: result.subjects
            });
        }
        catch (error) {
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para crear una materia
    createSubject = async (req, res) => {
        // Map frontend field names to backend field names
        const mappedData = {
            ...req.body,
            subject_name: req.body.nombre || req.body.subject_name,
            code_subject: req.body.codigo || req.body.code_subject,
            description: req.body.descripcion || req.body.description
        };
        // Remove Spanish field names
        delete mappedData.nombre;
        delete mappedData.codigo;
        delete mappedData.descripcion;

        const validation = validateCreateSubject(mappedData)
        try {
            if (!validation.success) {
                console.error('Validation error:', validation.error);
                return res.status(400).json({
                    error: "Datos inválidos",
                    details: validation.error
                });
            }
            const result = await this.model.createSubject(validation.data)
            return res.status(201).json({
                message: result.message,
                subject: result.subject
            });
        }
        catch (error) {
            console.error('Create error:', error);
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para actualizar una materia
    updateSubject = async (req, res) => {
        const { subjectId } = req.params

        console.log('=== UPDATE SUBJECT DEBUG ===');
        console.log('Subject ID:', subjectId);
        console.log('Raw request body:', JSON.stringify(req.body, null, 2));

        // Map frontend field names to backend field names
        const mappedData = {
            ...req.body,
            subject_name: req.body.nombre || req.body.subject_name,
            code_subject: req.body.codigo || req.body.code_subject,
            description: req.body.descripcion || req.body.description
        };
        // Remove Spanish field names
        delete mappedData.nombre;
        delete mappedData.codigo;
        delete mappedData.descripcion;

        console.log('Mapped data:', JSON.stringify(mappedData, null, 2));

        const validation = validateUpdateSubject(mappedData)
        console.log('Validation success:', validation.success);
        if (!validation.success) {
            console.log('Validation errors:', JSON.stringify(validation.error, null, 2));
        } else {
            console.log('Validated data:', JSON.stringify(validation.data, null, 2));
        }

        try {
            if (!validation.success) {
                console.error('Validation error:', validation.error);
                return res.status(400).json({
                    error: "Datos inválidos",
                    details: validation.error
                });
            }
            console.log('Sending to model:', JSON.stringify(validation.data, null, 2));
            const result = await this.model.updateSubject(subjectId, validation.data)
            console.log('Model result:', JSON.stringify(result, null, 2));
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json(result)
        }
        catch (error) {
            console.error('Update error:', error)
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }

    // controlador para actualizar asignaciones de materias a un grado
    updateSubjectGradeAssignments = async (req, res) => {
        const { gradeId, subjectIds } = req.body;
        try {
            const result = await this.model.updateSubjectGradeAssignments(gradeId, subjectIds);
            if (result.error) return res.status(400).json({ error: result.error });
            return res.status(200).json(result);
        } catch (error) {
            console.error('Error in updateSubjectGradeAssignments:', error);
            return res.status(500).json({ error: "Error interno del servidor" });
        }
    }

    // controlador para eliminar una materia
    deleteSubject = async (req, res) => {
        const { subjectId } = req.params
        try {
            const result = await this.model.deleteSubject(subjectId)
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({ message: result.message });
        }
        catch (error) {
            return res.status(500).json({ error: "Error interno del servidor" })
        }
    }
}
