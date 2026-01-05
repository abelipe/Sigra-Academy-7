import { validateCreateRecord, validateUpdateRecord } from "./records.schema.mjs";

export class AcademicRecordsController {
    constructor({ ModelRecords }) {
        this.model = ModelRecords;
    }

    // GET: Obtener el boletín
    getStudentReportCard = async (req, res) => {
        const { studentId } = req.params;
        try {
            if (!studentId || isNaN(studentId)) return res.status(400).json({ error: 'ID de estudiante inválido.' });
            const result = await this.model.getStudentReportCard(studentId);
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                student: result.student,
                academicRecords: result.academicRecords,
                averageScore: result.averageScore
            });

        } catch (error) {
            console.error('Error en getStudentReportCard:', error);
            return res.status(500).json({
                error: 'Error del servidor al generar el boletín.'
            });
        }
    }

    // Obtener todos los boletines por año académico
    getAllReportCardsByAcademicYear = async (req, res) => {
        const { yearId } = req.params;
        try {
            const result = await this.model.getAllReportCardsByAcademicYear(yearId);
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: 'Boletines obtenidos correctamente.',
                academicRecords: result.academicRecords
            });
        } catch (error) {
            console.error('Error en getAllReportCardsByAcademicYear:', error);
            return res.status(500).json({ error: 'Error del servidor al obtener los boletines.' });
        }
    }

    // POST: Crear registro académico
    createAcademicRecord = async (req, res) => {
        const validation = validateCreateRecord(req.body);
        try {
            if (!validation.success) {
                return res.status(400).json({ 
                    error: 'Datos inválidos', 
                    details: validation.error 
                });
            }
            const result = await this.model.createAcademicRecord(validation.data);
            if (result.error) return res.status(400).json({ error: result.error });
            return res.status(201).json({
                message: result.message,
                record: result.academicRecord
            });
        } 
        catch (error) {
            console.error('Error en createAcademicRecord:', error);
            return res.status(500).json({ error: 'Error al crear el registro académico.' });
        }
    }

    // PATCH: Actualizar nota
    updateAcademicRecord = async (req, res) => {
        const { recordId } = req.params;
        const validation = validateUpdateRecord(req.body);
        try {
            if(!validation.success){
                return res.status(400).json({ 
                    error: 'Datos inválidos', 
                    details: validation.error 
                });
            }
            const result = await this.model.updateAcademicRecord(recordId, validation.data);
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({
                message: result.message,
                updatedRecord: result.academicRecord
            });
        } catch (error) {
            console.error('Error en updateAcademicRecord:', error);
            return res.status(500).json({ error: 'Error al actualizar registro.' });
        }
    }

    // Controlador para eliminar un registro académico
    deleteAcademicRecord = async (req, res) => {
        const { recordId } = req.params;
        try {
            const result = await this.model.deleteAcademicRecord(recordId);
            if (result.error) return res.status(404).json({ error: result.error });
            return res.status(200).json({ message: result.message });
        } 
        catch (error) {
            console.error('Error en deleteAcademicRecord:', error);
            return res.status(500).json({ error: 'Error al eliminar el registro académico.' });
        }
    }
}