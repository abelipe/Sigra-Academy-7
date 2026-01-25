import { db } from "../../../../database/db.database.mjs";

// Modelo que interactua con la tabla schedules de la base de datos (Horarios académicos)
export class SchedulesModel {
    // Método para obtener el horario de una sección especifico
    static async getScheduleBySectionId(sectionId) {
        if (!sectionId) return { error: 'El ID de la sección es requerido.' };
        // Se verifica si la sección existe
        const [existingSection] = await db.query(
            `SELECT * FROM sections WHERE section_id = ?`,
            [sectionId]
        );
        if (existingSection.length === 0) return { error: 'La sección especificada no existe.' };
        // Si existe, se obtiene el horario
        const [schedules] = await db.query(
            `SELECT 
            sch.*, 
            sec.section_name, 
            sub.subject_name, 
            CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
            g.grade_name, 
            ta.assignment_id, 
            ay.name AS academic_year 
            FROM schedules sch
            JOIN teacher_assignments ta ON sch.assignment_id = ta.assignment_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN subjects sub ON ta.subject_id = sub.subject_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE sec.section_id = ?
            ORDER BY 
            FIELD(sch.day_of_week, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'),
            sch.start_time;`,
            [sectionId]
        );
        if (schedules.length === 0) return { error: 'No se encontraron horarios para la sección especificada.' };
        return {
            message: 'Horario obtenido exitosamente.',
            schedules: schedules
        }
    }

    // Obtener una asignación(curso asignado) por su ID
    static async getScheduleById(scheduleId) {
        if (!scheduleId) return { error: 'El ID del horario es requerido.' };
        const [schedules] = await db.query(
            `SELECT 
            sch.schedule_id, 
            sch.assignment_id, 
            sch.day_of_week, 
            sch.start_time, 
            sch.end_time,
            sch.classroom, 
            sub.subject_name, 
            sec.section_name, 
            g.grade_name, 
            ay.name AS academic_year,
            CONCAT(u.first_name, ' ', u.last_name) AS teacher_name 
            FROM schedules sch
            JOIN teacher_assignments ta ON sch.assignment_id = ta.assignment_id
            JOIN subjects sub ON ta.subject_id = sub.subject_id  
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE sch.schedule_id = ?;`,
            [scheduleId]
        );
        if (schedules.length === 0) return { error: 'No se encontró el horario especificado.' };
        return {
            message: 'Horario obtenido exitosamente.',
            schedule: schedules[0]
        }
    }

    // Método para crear un nuevo horario
    static async createSchedule(data) {
        if (!data) return { error: 'Los datos del horario son requeridos.' };
        const { assignment_id, ...rest } = data;
        // Se verifica si la asignación existe
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignment_id]
        );
        if (existingAssignment.length === 0) return { error: 'La asignación especificada no existe.' };
        // Si existe, se crea el horario
        const [result] = await db.query(
            `INSERT INTO schedules (assignment_id, day_of_week, start_time, end_time, classroom)
            VALUES (?, ?, ?, ?, ?)`,
            [assignment_id, rest.day_of_week, rest.start_time, rest.end_time, rest.classroom]
        );
        // Se retorna el nuevo horario creado
        const [newSchedule] = await db.query(
            `SELECT * FROM schedules WHERE schedule_id = ?`,
            [result.insertId]
        );
        return {
            message: 'Horario creado exitosamente.',
            schedule: newSchedule[0]
        };
    }

    // Método para actualizar un horario existente
    static async updateSchedule(scheduleId, data) {
        if (!scheduleId || !data) return { error: 'El ID del horario y los datos son requeridos.' };
        const allowedFields = ['day_of_week', 'start_time', 'end_time', 'classroom'];
        const updateTofields = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateTofields[field] = data[field];
            }
        }
        // Se verifica si el horario existe
        const [existingSchedule] = await db.query(
            `SELECT * FROM schedules WHERE schedule_id = ?`,
            [scheduleId]
        );
        if (existingSchedule.length === 0) return { error: 'El horario especificado no existe.' };
        // Si existe, se actualiza el horario
        const fields = [];
        const values = [];

        Object.entries(updateTofields).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(scheduleId); // Para la cláusula WHERE
        const [updatedSchedule] = await db.query(
            `UPDATE schedules SET ${fields.join(', ')} WHERE schedule_id = ?`,
            values
        );
        // Se obtiene el horario actualizado
        const [newSchedule] = await db.query(
            `SELECT 
            sch.*, 
            sec.section_name, 
            sub.subject_name, 
            CONCAT(u.first_name, ' ', u.last_name) AS teacher_name,
            g.grade_name, 
            ta.assignment_id, 
            ay.name AS academic_year 
            FROM schedules sch
            JOIN teacher_assignments ta ON sch.assignment_id = ta.assignment_id
            JOIN subjects sub ON ta.subject_id = sub.subject_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN academic_years ay ON sec.academic_year_id = ay.year_id
            JOIN users u ON ta.teacher_user_id = u.user_id
            WHERE sch.schedule_id = ?;`,
            [scheduleId]
        );
        return {
            message: 'Horario actualizado exitosamente.',
            schedule: newSchedule[0]
        };
    }

    // Método para eliminar un horario existente
    static async deleteSchedule(scheduleId) {
        if (!scheduleId) return { error: 'El ID del horario es requerido.' };
        // Se verifica si el horario existe
        const [existingSchedule] = await db.query(
            `SELECT * FROM schedules WHERE schedule_id = ?`,
            [scheduleId]
        );
        if (existingSchedule.length === 0) return { error: 'El horario especificado no existe.' };
        // Si existe, se elimina el horario
        await db.query(
            `DELETE FROM schedules WHERE schedule_id = ?`,
            [scheduleId]
        );
        return {
            message: 'Horario eliminado exitosamente.'
        };
    }
}
