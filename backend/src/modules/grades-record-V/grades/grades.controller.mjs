import { validateCreateGradeLog, validateUpdateGradeLog } from "./grades.schema.mjs";
// Controlador que maneja las solicitudes relacionadas con los registros de calificaciones
export class GradesLogController {
    constructor({ModelGradesLog}){
        this.model = ModelGradesLog;
    }

    // Controlador para obtener los registros de calificaciones por ID de actividad
    getGradesLogByActivityId = async (req, res) => {
        const { activityId } = req.params;
        try{
            const result = await this.model.getGradesLogByActivityId(activityId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grades: result.grades
            });
        }
        catch(error){
            console.error('Error en GradesLogController.getGradesLogByActivityId:', error);
            return res.status(500).json({
                error: `Error del servidor al obtener los registros de 
                calificaciones por ID de actividad.`
            });
        }
    }

    // Controlador para obtener todas las calificaciones
    getAllGradesLog = async (req, res) => {
        try{
            const result = await this.model.getAllGradesLog();
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grades: result.grades
            });
        }
        catch(error){
            console.error('Error en GradesLogController.getAllGradesLog:', error);
            return res.status(500).json({
                error: `Error del servidor al obtener todos los registros de calificaciones.`
            });
        }
    }

    // Controlador para obtener los registros de calificaciones por el ID del usuario
    getGradesLogByUserId = async (req, res) => {
        const { userId } = req.params;
        try{
            const result = await this.model.getGradesLogByUserId(userId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grades: result.grades
            });
        }
        catch(error){
            console.error('Error en GradesLogController.getGradesLogByUserId:', error);
            return res.status(500).json({
                error: `Error del servidor al obtener los registros de calificaciones por ID de usuario.`
            })
        }
    }

    // Controlador para obtener las calificaciones de una actividad de una materia específica
    getGradesLogByActivityAndSubject = async (req, res) => {
        const { activityId, subjectId } = req.params;
        try{
            const result = await this.model.getGradesLogByActivityAndSubject(activityId, subjectId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grades: result.grades
            });
        }
        catch(error){
            console.error('Error en GradesLogController.getGradesLogByActivityAndSubject:', error);
            return res.status(500).json({
                error: `Error del servidor al obtener los registros de calificaciones por ID de actividad y materia.`
            });
        }
    }

    // Controlador para dar una calificación a un estudainte y registrar la nota
    addGradeLogEntry = async (req, res) => {
        const validation = validateCreateGradeLog(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Datos de calificación inválidos.',
                    details: validation.error
                });
            }
            const result = await this.model.addGradeLogEntry(validation.data);
            if(result.error) return res.status(400).json({error: result.error});
            return res.status(201).json({
                message: result.message,
                grade: result.grade
            });
        }
        catch(error){
            console.error('Error en GradesLogController.addGradeLogEntry:', error);
            return res.status(500).json({
                error: `Error del servidor al agregar un registro de calificación.`
            });
        }
    }

    // Controlador para actualizar un registro de calificación existente
    updateGradeLogEntry = async (req, res) => {
        const { gradeLogId } = req.params;
        const validation = validateUpdateGradeLog(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Datos de calificación inválidos para actualización.',
                    details: validation.error
                });
            }
            const result = await this.model.updateGradeLogEntry(gradeLogId, validation.data);
            if(result.error) return res.status(400).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                grade: result.grade
            });
        }
        catch(error){
            console.error('Error en GradesLogController.updateGradeLogEntry:', error);
            return res.status(500).json({
                error: `Error del servidor al actualizar el registro de calificación.`
            })
        }
    }

    // Controlador para eliminar un registro de calificación
    deleteGradeLogEntry = async (req, res) => {
        const { gradeLogId } = req.params;
        try{
            const result = await this.model.deleteGradeLogEntry(gradeLogId);
            if(result.error) return res.status(400).json({error: result.error});
            return res.status(200).json({
                message: result.message
            });
        }
        catch(error){
            console.error('Error en GradesLogController.deleteGradeLogEntry:', error);
            return res.status(500).json({
                error: `Error del servidor al eliminar el registro de calificación.`
            });
        }
    }
}