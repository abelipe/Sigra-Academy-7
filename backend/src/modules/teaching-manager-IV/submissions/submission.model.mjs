import { db } from "../../../../database/db.database.mjs";
import fs from 'fs';
// Modelo que interactúa con la tabla submissions de la base de datos
export class SubmissionModel {
    // Método para obtener todas las entregas de una actividad especifica
    static async getSubmissionByActivityId(activityId) {
        if (!activityId) return { error: 'El ID de la actividad es requerido' };
        // Se verifica si existe la actividad
        const [existingActivity] = await db.query(
            `SELECT * FROM activities WHERE activity_id = ?`,
            [activityId]
        );
        if (existingActivity.length === 0) return { error: 'La actividad no existe' };
        // Si existe, se obtienen las entregas asociadas
        const [submissions] = await db.query(
            `SELECT sub.submission_id, act.title, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            sub.file_path, sub.submission_date, sub.comments, sec.section_name FROM submissions sub
            JOIN activities act ON sub.activity_id = act.activity_id
            JOIN teacher_assignments ta ON act.assignment_id = ta.assignment_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN users u ON sub.student_user_id = u.user_id
            WHERE sub.activity_id = ?`,
            [activityId]
        )
        if (submissions.length === 0) return { error: 'No hay entregas para esta actividad' };
        return {
            message: 'Entregas obtenidas exitosamente',
            submissions: submissions
        }
    }

    // Método para obtener una entrega por su ID
    static async getSubmissionById(submissionId) {
        if (!submissionId) return { error: 'El ID de la entrega es requerido' };
        const [submission] = await db.query(
            `SELECT sub.submission_id, act.title, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            sub.file_path, sub.submission_date, sub.comments, sec.section_name, g.grade_name FROM submissions sub
            JOIN activities act ON sub.activity_id = act.activity_id
            JOIN teacher_assignments ta ON act.assignment_id = ta.assignment_id
            JOIN sections sec ON ta.section_id = sec.section_id
            JOIN grades g ON sec.grade_id = g.grade_id
            JOIN users u ON sub.student_user_id = u.user_id
            WHERE sub.submission_id = ?`,
            [submissionId]
        );
        if (submission.length === 0) return { error: 'La entrega no existe' };
        return {
            message: 'Entrega obtenida exitosamente',
            submission: submission[0]
        }
    }

    // Método para obtener todas las entregas de un estudiante
    static async getSubmissionByUserId(studentUserId) {
        if (!studentUserId) return { error: 'El ID del estudiante es requerido' };
        // Se verifica si existe el estudiante
        const [existingUser] = await db.query(
            `SELECT u.* FROM users u JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Estudiante'`,
            [studentUserId]
        );
        if (existingUser.length === 0) return { error: 'El estudiante no existe' };
        // Si existe, se obtienen las entregas asociadas
        const [submissions] = await db.query(
            `SELECT sub.*, act.title, sec.section_name, g.grade_name, gl.score, gl.feedback 
                FROM submissions sub
                JOIN activities act ON sub.activity_id = act.activity_id
                JOIN teacher_assignments ta ON act.assignment_id = ta.assignment_id
                JOIN sections sec ON ta.section_id = sec.section_id
                JOIN grades g ON sec.grade_id = g.grade_id
                LEFT JOIN grades_log gl ON gl.activity_id = sub.activity_id 
                AND gl.student_user_id = sub.student_user_id
             WHERE sub.student_user_id = ?`,
            [studentUserId]
        );
        if (submissions.length === 0) return { error: 'No hay entregas para este estudiante' };
        return {
            message: `Entregas obtenidas exitosamente del estudainte ${existingUser[0].first_name} ${existingUser[0].last_name}`,
            submissions: submissions
        }
    }

    // Método para crear una nueva entrega
    static async createSubmission(data) {
        const { activity_id, student_user_id, ...rest } = data;
        // Se verifica si existe la actividad
        const [existingActivity] = await db.query(
            `SELECT * FROM activities WHERE activity_id = ?`,
            [activity_id]
        );
        // Además, se verifica si existe el estudiante
        const [existingUser] = await db.query(
            `SELECT u.* FROM users u JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Estudiante'`,
            [student_user_id]
        );
        if (existingActivity.length === 0 || existingUser.length === 0) {
            return { error: 'La actividad o el estudiante no existen' };
        }
        // Si existen, se crea la nueva entrega
        const [result] = await db.query(
            `INSERT INTO submissions (activity_id, student_user_id, file_path, comments)
            VALUES (?, ?, ?, ?)`,
            [activity_id, student_user_id, rest.file_path, rest.comments || null]
        );
        if (result.affectedRows === 0) return { error: 'No se pudo crear la entrega' };
        // Se obtiene la entrega creada
        const [submission] = await db.query(
            `SELECT * FROM submissions WHERE submission_id = ?`,
            [result.insertId]
        );
        if (submission.length === 0) return { error: 'No se pudo obtener la entrega creada' };
        return {
            message: 'Entrega creada exitosamente',
            submission: submission[0]
        }
    }

    // Método para actualizar una entrega existente
    static async updateSubmission(submissionId, data) {
        if (!submissionId || !data) return { error: 'El ID de la entrega y los datos son requeridos' };
        const allowedFields = ['file_path', 'comments'];
        const updatetoField = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updatetoField[field] = data[field];
            }
        }
        // Se verifica que exista la entrega
        const [existingSubmission] = await db.query(
            `SELECT * FROM submissions WHERE submission_id = ?`,
            [submissionId]
        );
        if (existingSubmission.length === 0) return { error: 'La entrega no existe' };
        // Si existe, se procede a actualizarla
        const fields = [];
        const values = [];

        Object.entries(updatetoField).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(submissionId);

        const [result] = await db.query(
            `UPDATE submissions SET ${fields.join(', ')} WHERE submission_id = ?`,
            values
        );
        if (result.affectedRows === 0) return { error: 'No se pudo actualizar la entrega' };
        // Se obtiene la entrega actualizada
        const [submission] = await db.query(
            `SELECT * FROM submissions WHERE submission_id = ?`,
            [submissionId]
        );
        return {
            message: 'Entrega actualizada exitosamente',
        }
    }

    // Método para eliminar una entrega
    static async deleteSubmission(submissionId) {
        if (!submissionId) return { error: 'El ID de la entrega es requerido' };
        // Se verifica que exista la entrega
        const [existingSubmission] = await db.query(
            `SELECT * FROM submissions WHERE submission_id = ?`,
            [submissionId]
        );
        if (existingSubmission.length === 0) return { error: 'La entrega no existe' };
        // Si existe, se procede a eliminarla
        const [result] = await db.query(
            `DELETE FROM submissions WHERE submission_id = ?`,
            [submissionId]
        );
        if (result.affectedRows === 0) return { error: 'No se pudo eliminar la entrega' };
        // A su vez se borra el archivo que se creo en la carpeta uploads/submissions

        const filePath = existingSubmission[0].file_path;
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error al eliminar el archivo:', err);
            }
        });
        return {
            message: 'Entrega eliminada exitosamente'
        }
    }
}