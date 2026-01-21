import { db } from "../../../../database/db.database.mjs";

// Modelo que interactúa con la tabla course_access_log de la base de datos
export class AssistanceModel {
    // Método para obtener todos los registros de asistencia de una asignación
    static async getAllAssistances(assignmentId) {
        if (!assignmentId) return { error: 'El ID de la asignación es requerido.' };
        const [assistances] = await db.query(
            `SELECT cal.access_id, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            sub.subject_name, cal.access_timestamp FROM course_access_log cal
            JOIN users u ON cal.student_user_id = u.user_id
            JOIN teacher_assignments ta ON cal.assignment_id = ta.assignment_id
            JOIN subjects sub ON ta.subject_id = sub.subject_id
            WHERE cal.assignment_id = ?`,
            [assignmentId]
        );
        if (assistances.length === 0) return { error: 'No se encontraron registros de asistencia.' };
        return {
            message: 'Registros de asistencia obtenidos exitosamente.',
            assistances: assistances
        }
    }

    // Método para registrar la asistencia de un estudiante a una asignación
    static async registerAssistance(data) {
        if (!data) return { error: 'Los datos de asistencia son requeridos.' };
        const { student_user_id, assignment_id } = data;
        // Se verifica que el estudiante exista y la asignación exista
        const [existingUser] = await db.query(
            `SELECT u.* FROM users u JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Estudiante'`,
            [student_user_id]
        );
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignment_id]
        );
        if (existingUser.length === 0) return { error: 'El estudiante no existe.' };
        if (existingAssignment.length === 0) return { error: 'La asignación no existe.' };
        // Se registra la asistencia
        const [newAssistance] = await db.query(
            `INSERT INTO course_access_log (student_user_id, assignment_id)
            VALUES (?, ?)`,
            [student_user_id, assignment_id]
        );
        if (newAssistance.affectedRows === 0) return { error: 'No se pudo registrar la asistencia.' };
        return {
            message: 'Asistencia registrada exitosamente.',
            assistanceId: newAssistance.insertId
        };
    }

    // Método para actualizar un registro de asistencia
    static async updateAssistance(accessId) {
        if (!accessId) return { error: 'El ID de asistencia es requerido.' };
        // Se verifica que exista el registro de asistencia
        const [existingAssistance] = await db.query(
            `SELECT * FROM course_access_log WHERE access_id = ?`,
            [accessId]
        );
        if (existingAssistance.length === 0) return { error: 'El registro de asistencia no existe.' };
        // Si existe se actualiza la marca de tiempo
        const [updatedAssistance] = await db.query(
            `UPDATE course_access_log SET access_timestamp = CURRENT_TIMESTAMP
            WHERE access_id = ?`,
            [accessId]
        );
        if (updatedAssistance.affectedRows === 0) return { error: 'No se pudo actualizar el registro de asistencia.' };
        return {
            message: 'Registro de asistencia actualizado exitosamente.'
        };
    }
}