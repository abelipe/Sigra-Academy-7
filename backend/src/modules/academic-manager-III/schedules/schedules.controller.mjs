import { validateCreateSchedule, validateUpdateSchedule } from "./schedules.schema.mjs";

// Controlador que maneja las solicitudes relacionadas con los horarios académicos
export class SchedulesController {
    constructor({ModelSchedules}){
        this.ModelSchedules = ModelSchedules;
    }

    // Obtener el horario de una sección por su ID
    getScheduleBySectionId = async (req, res) => {
        const { sectionId } = req.params;
        try{
            const result = await this.ModelSchedules.getScheduleBySectionId(sectionId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                schedules: result.schedules
            });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Obtener un horario por su ID
    getScheduleById = async (req, res) => {
        const { scheduleId } = req.params;
        try{
            const result = await this.ModelSchedules.getScheduleById(scheduleId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                schedule: result.schedule
            });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Crear un nuevo horario
    createSchedule = async (req, res) => {
        const validation = validateCreateSchedule(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Datos inválidos para crear el horario',
                    details: validation.error
                });
            }
            const result = await this.ModelSchedules.createSchedule(validation.data);
            if(result.error) return res.status(400).json({error: result.error});
            return res.status(201).json({
                message: result.message,
                schedule: result.schedule
            });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error del servidor'});
        }
    }

    // Actualizar un horario existente
    updateSchedule = async (req, res) => {
        const { scheduleId } = req.params;
        const validation = validateUpdateSchedule(req.body);
        try{
            if(!validation.success){
                return res.status(400).json({
                    error: 'Error de validación al actualizar el horario',
                    details: validation.error
                });
            }
            const result = await this.ModelSchedules.updateSchedule(scheduleId, validation.data);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({
                message: result.message,
                schedule: result.schedule
            });
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error Interno del Servidor'});
        }
    }

    // Eliminar un horario existente
    deleteSchedule = async (req, res) => {
        const { scheduleId } = req.params;
        try{
            const result = await this.ModelSchedules.deleteSchedule(scheduleId);
            if(result.error) return res.status(404).json({error: result.error});
            return res.status(200).json({message: result.message});
        }
        catch(error){
            console.error(error);
            return res.status(500).json({error: 'Error Interno del Servidor'});
        }
    }
}
