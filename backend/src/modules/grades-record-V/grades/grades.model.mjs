import { db } from "../../../../database/db.database.mjs";

// Modelo que interactuá con la tabla de grades_log en la base de datos
export class GradesLogModel {
    // Método para obtener todos los registros de calificaciones de una actividad
    static async getGradesLogByActivityId(activityId) {
        if (!activityId) return { error: 'No se propocionó el ID de la actividad.' };
        // Se verifica que la actividad exista
        const [existingActivity] = await db.query(
            `SELECT * FROM activities WHERE activity_id = ?`,
            [activityId]
        );
        if (existingActivity.length === 0) return { error: 'La actividad no existe.' };
        // Si existe, se obtienen los registros de calificaciones
        const [gradesLog] = await db.query(
            `SELECT gl.grade_id, gl.student_user_id, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            gl.score, gl.feedback, a.title, s.section_name, su.subject_name FROM grades_log gl 
            JOIN users u ON gl.student_user_id = u.user_id
            JOIN activities a ON gl.activity_id = a.activity_id
            JOIN teacher_assignments ta ON a.assignment_id = ta.assignment_id
            JOIN sections s ON ta.section_id = s.section_id
            JOIN subjects su ON ta.subject_id = su.subject_id
            WHERE gl.activity_id = ?`,
            [activityId]
        );
        if (gradesLog.length === 0) {
            const [fallback] = await db.query(
                `SELECT gl.grade_id, gl.student_user_id, CONCAT(u.first_name, ' ', u.last_name) AS student_name, gl.score, gl.feedback, a.title FROM grades_log gl JOIN users u ON gl.student_user_id = u.user_id JOIN activities a ON gl.activity_id = a.activity_id WHERE gl.activity_id = ?`,
                [activityId]
            );
            if (fallback.length === 0) {
                return { message: 'No hay registros de calificaciones para esta actividad.' };
            }
            return {
                message: `Se encontraron ${fallback.length} registros de calificaciones.`,
                grades: fallback
            };
        }
        console.debug('getGradesLogByActivityId - rows:', gradesLog.length);
        return {
            message: `Se encontraron ${gradesLog.length} registros de calificaciones.`,
            grades: gradesLog
        }
    }

    // Método para obtener todos los registros de calificaciones de un estudiante
    static async getGradesLogByUserId(userId) {
        if (!userId) return { error: 'No se propocionó el ID del usuario.' };
        // Se verifica que el usuario exista
        const [existingUser] = await db.query(
            `SELECT u.*,r.* FROM users u
            JOIN roles r ON u.role_id = r.role_id
            WHERE u.user_id = ? AND r.role_name = 'Estudiante'`,
            [userId]
        );
        if (existingUser.length === 0) return { error: 'El usuario no existe o no es un estudiante.' };
        // Si existe, se obtienen los registros de calificaciones de dicho estudiante
        const [gradesLog] = await db.query(
            `SELECT gl.grade_id, gl.activity_id, gl.student_user_id, CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            gl.score, gl.feedback, a.title, s.section_name FROM grades_log gl JOIN users u ON gl.student_user_id = u.user_id
            JOIN activities a ON gl.activity_id = a.activity_id
            JOIN teacher_assignments ta ON a.assignment_id = ta.assignment_id
            JOIN sections s ON ta.section_id = s.section_id
            WHERE gl.student_user_id = ?`,
            [userId]
        );
        if (gradesLog.length === 0) return { message: 'No hay registros de calificaciones para este estudiante.' };
        return {
            message: `Se encontraron ${gradesLog.length} registros de calificaciones.`,
            grades: gradesLog
        }
    }

    // Método para obtener todas las calificaciones de un actividad de una materia en especifico
    static async getGradesLogByActivityAndSubject(activityId, subjectId) {
        if (!activityId || !subjectId) return { error: 'No se propocionó el ID de la actividad o de la materia.' };
        // Se verifica que la actividad y la materia existan
        const [exisitingActivity] = await db.query(
            `SELECT * FROM activities WHERE activity_id = ?`,
            [activityId]
        );
        const [existingSubject] = await db.query(
            `SELECT * FROM subjects WHERE subject_id = ?`,
            [subjectId]
        );
        if (exisitingActivity.length === 0 || existingSubject.length === 0) {
            return { error: 'La actividad o la materia no existen.' };
        }
        // Si existen, se obtienen los registros de calificaciones
        const [gradesLog] = await db.query(
            `SELECT CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            gl.score, gl.feedback, a.title, su.subject_name, s.section_name FROM grades_log gl JOIN users u ON gl.student_user_id = u.user_id
            JOIN activities a ON gl.activity_id = a.activity_id
            JOIN teacher_assignments ta ON a.assignment_id = ta.assignment_id
            JOIN sections s ON ta.section_id = s.section_id
            JOIN subjects su ON ta.subject_id = su.subject_id
            WHERE gl.activity_id = ? AND su.subject_id = ?`,
            [activityId, subjectId]
        );
        if (gradesLog.length === 0) return { message: 'No hay registros de calificaciones para esta actividad y materia.' };
        return {
            message: `Se encontraron ${gradesLog.length} registros de calificaciones.`,
            grades: gradesLog
        }
    }

    // Método para obtener todos los registros de calificaciones
    static async getAllGradesLog() {
        const [gradesLog] = await db.query(
            `SELECT CONCAT(u.first_name, ' ', u.last_name) AS student_name,
            gl.score, gl.feedback, a.title, s.section_name FROM grades_log gl JOIN users u ON gl.student_user_id = u.user_id
            JOIN activities a ON gl.activity_id = a.activity_id
            JOIN teacher_assignments ta ON a.assignment_id = ta.assignment_id
            JOIN sections s ON ta.section_id = s.section_id`
        );
        if (gradesLog.length === 0) return { message: 'No hay registros de calificaciones.' };
        return {
            message: `Se encontraron ${gradesLog.length} registros de calificaciones.`,
            grades: gradesLog
        }
    }

    // Método para dar una calificación a un estudiante y registrar la nota
    static async addGradeLogEntry(dataGrades) {
        if (!dataGrades) return { error: 'No se proporcionaron datos de calificación.' };
        const { activity_id, student_user_id, ...rest } = dataGrades;
        // Se verifica que exista la actividad y el estudiante
        const [existingActivity] = await db.query(
            `SELECT * FROM activities WHERE activity_id = ?`,
            [activity_id]
        );
        const [existingUser] = await db.query(
            `SELECT u.*, r.* FROM users u JOIN roles r ON r.role_id = u.role_id
            WHERE u.user_id = ? AND r.role_name = 'Estudiante'`,
            [student_user_id]
        );
        if (existingActivity.length === 0 || existingUser.length === 0) {
            return { error: 'La actividad o el estudiante no existen.' };
        }

        // Si existe, se inserta la nota
        const [newGradeLog] = await db.query(
            `INSERT INTO grades_log (activity_id, student_user_id, score, feedback)
            VALUES (?, ?, ?, ?)`,
            [activity_id, student_user_id, rest.score, rest.feedback]
        );
        if (newGradeLog.affectedRows === 0) return { error: 'No se pudo agregar el registro de calificación.' };
        const [insertedGradeLog] = await db.query(
            `SELECT * FROM grades_log WHERE grade_id = ?`,
            [newGradeLog.insertId]
        )
        return {
            message: 'Registro de calificación agregado exitosamente.',
            grade: insertedGradeLog
        }
    }

    // Método para actualizar un registro de calificación
    static async updateGradeLogEntry(gradeLogId, dataGrades) {
        if (!gradeLogId || !dataGrades) return { error: 'No se proporcionó el ID del registro o los datos de calificación.' };
        const allowedFields = ['score', 'feedback'];
        // Hago un ciclo dinamico para agrear los campos que se va actualizar
        const fieldstoUpdate = {};
        for (const field of allowedFields) {
            if (dataGrades[field] !== undefined) {
                fieldstoUpdate[field] = dataGrades[field];
            }
        }
        // Se verifica si existe el registro de calificación
        const [existingGradeLog] = await db.query(
            `SELECT * FROM grades_log WHERE grade_id = ?`,
            [gradeLogId]
        );
        if (existingGradeLog.length === 0) return { error: 'El registro de calificación no existe.' };
        // Si existe, se procede a actualizarlo
        const fields = [];
        const values = [];

        Object.entries(fieldstoUpdate).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(gradeLogId); // Agrego el ID al final para la cláusula WHERE
        const [updatedGradeLog] = await db.query(
            `UPDATE grades_log SET ${fields.join(', ')} WHERE grade_id = ?`,
            values
        );
        if (updatedGradeLog.affectedRows === 0) return { error: 'No se pudo actualizar el registro de calificación.' };
        const [fetchedUpdatedGradeLog] = await db.query(
            `SELECT * FROM grades_log WHERE grade_id = ?`,
            [gradeLogId]
        );
        return {
            message: 'Registro de calificación actualizado exitosamente.',
            grade: fetchedUpdatedGradeLog
        }
    }

    // Método para eliminar un registro de calificación
    static async deleteGradeLogEntry(gradeLogId) {
        if (!gradeLogId) return { error: 'No se proporcionó el ID del registro de calificación.' };
        // Se verifica si existe el registro de calificación
        const [existingGradeLog] = await db.query(
            `SELECT * FROM grades_log WHERE grade_id = ?`,
            [gradeLogId]
        );
        if (existingGradeLog.length === 0) return { error: 'El registro de calificación no existe.' };
        // Si existe, se procede a eliminarlo
        const [deletedGradeLog] = await db.query(
            `DELETE FROM grades_log WHERE grade_id = ?`,
            [gradeLogId]
        );
        if (deletedGradeLog.affectedRows === 0) return { error: 'No se pudo eliminar el registro de calificación.' };
        return {
            message: 'Registro de calificación eliminado exitosamente.'
        }
    }
}