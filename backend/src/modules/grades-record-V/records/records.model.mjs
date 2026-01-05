import { db } from "../../../../database/db.database.mjs";

export class AcademicRecordsModel {

    // 1. OBTENER BOLETÍN DE UN ESTUDIANTE
    static async getStudentReportCard(studentId) {
       if(!studentId) return { error: 'Se requiere el ID del estudiante.' };
       // Se verifica que exista el estudiante
       const [existingStudent] = await db.query(
            `SELECT CONCAT(u.first_name, ' ', u.last_name) AS full_name FROM users U JOIN roles r ON u.role_id = r.role_id
             WHERE u.user_id = ? AND r.role_name = 'student'`,
            [studentId]
       );
       if(existingStudent.length === 0) return { error: 'Estudiante no encontrado.' };
       // Si existe, se obtienen sus registros académicos
       const [academicRecords] = await db.query(
            `SELECT far.record_id, far.final_score, far.status, su.subject_name,
            CONCAT(t.first_name, ' ', t.last_name) AS teacher_name, s.section_name , ay.name FROM final_academic_records far
            JOIN teacher_assignments ta ON far.assignment_id = ta.assignment_id
            JOIN sections s ON ta.section_id = s.section_id
            JOIN subjects su ON ta.subject_id = su.subject_id
            JOIN users t ON ta.teacher_user_id = t.user_id
            JOIN academic_years ay ON s.academic_year_id = ay.year_id
            WHERE far.student_user_id = ?`,
            [studentId]
        );
        if(academicRecords.length === 0) return { message: 'El estudiante no tiene registros académicos.' };
        // Ahora sacamos el promedio general
        const totalScores = academicRecords.reduce((sum, record) => sum + record.final_score, 0);
        const averageScore = (totalScores / academicRecords.length).toFixed(2);

        return {
            message: 'Boletín del estudiante obtenido correctamente.',
            student: existingStudent[0],
            academicRecords: academicRecords,
            averageScore: parseFloat(averageScore)
        }
    }

    // Obtener todos los boletines por el año académico
    static async getAllReportCardsByAcademicYear(yearId) {
        if(!yearId) return { error: 'Se requiere el ID del año académico.' };
        // Se verifica si existe el año académico
        const [existingYear] = await db.query(
            `SELECT * FROM academic_years WHERE year_id = ?`,
            [yearId]
        );
        if(existingYear.length === 0) return { error: 'Año académico no encontrado.' };
        // Si existe, se obtienen todos los registros académicos de ese año
        const [academicRecords] = await db.query(
            `SELECT far.record_id, far.final_score, far.status, su.subject_name,
            CONCAT(t.first_name, ' ', t.last_name) AS teacher_name, s.section_name , ay.name, 
            CONCAT(u.first_name, ' ', u.last_name) AS student_name FROM final_academic_records far
            JOIN teacher_assignments ta ON far.assignment_id = ta.assignment_id
            JOIN sections s ON ta.section_id = s.section_id
            JOIN subjects su ON ta.subject_id = su.subject_id
            JOIN users t ON ta.teacher_user_id = t.user_id
            JOIN users u ON far.student_user_id = u.user_id
            JOIN academic_years ay ON s.academic_year_id = ay.year_id
            WHERE ay.year_id = ?`,
            [yearId]
        );
        if(academicRecords.length === 0) return { message: 'No hay registros académicos para el año especificado.' };
        return {
            message: `Registros académicos del año ${existingYear[0].name} obtenidos correctamente.`,
            academicRecords: academicRecords
        }
    }

    // 2. CREAR REGISTRO FINAL (POST)
    static async createAcademicRecord(data) {
        if(!data) return { error: 'Datos incompletos para crear el registro académico.' };
        const { student_user_id, assignment_id, ...rest} = data;
        // Se verifica que exista el estudiante y la asignación
        const [existingStudent] = await db.query(
            `SELECT * FROM users U JOIN roles r ON r.role_id = u.role_id
            WHERE u.user_id = ? AND r.role_name = 'student'`,
            [student_user_id]
        );
        const [existingAssignment] = await db.query(
            `SELECT * FROM teacher_assignments WHERE assignment_id = ?`,
            [assignment_id]
        );
        if(existingStudent.length === 0 || existingAssignment.length === 0) {
            return { error: 'Estudiante o asignación no encontrados.' };
        }
        // Si existen, se crea el registro académico final
        const [result] = await db.query(
            `INSERT INTO final_academic_records (student_user_id, assignment_id, final_score)
            VALUES (?, ?, ?)`,
            [student_user_id, assignment_id, rest.final_score || 0]
        );
        // Obtenemos el nuevo registro creado
        const [newRecord] = await db.query(
            `SELECT * FROM final_academic_records WHERE record_id = ?`,
            [result.insertId]
        );
        if(newRecord.length === 0) return { error: 'Error al crear el registro académico.' };
        // Si la nota es mayor o igual a 10, se marca como aprobado
        if(rest.final_score !== undefined && rest.final_score >= 10) {
            await db.query(
                `UPDATE final_academic_records SET status = 'Aprobado' WHERE record_id = ?`,
                [result.insertId]
            );
            return {
                message: 'Registro académico creado correctamente y marcado como Aprobado.',
                academicRecord: newRecord[0]
            }
        }
        // De lo contrario, se deja como pendiente o aplazado
        await db.query(
            `UPDATE final_academic_records SET status = 'Aplazado' WHERE record_id = ?`,
            [result.insertId]
        );
        return {
            message: 'Registro académico creado correctamente y marcado como Aplazado.',
            academicRecord: newRecord[0]
        }
    }

    // 3. ACTUALIZAR NOTA (PATCH)
    static async updateAcademicRecord(recordId, data) {
        if(!recordId || !data) return { error: 'Datos incompletos para actualizar el registro académico.' };
        // Se desigan los campos que se va a actualizar
        const allowedFields = ['final_score', 'status'];
        // Se prepara la consulta dinámica
        const fieldsToUpdate = {};
        for(const field of allowedFields) {
            if(data[field] !== undefined) {
                fieldsToUpdate[field] = data[field];
            }
        }
        // Se verifica que el registro exista
        const [existingRecord] = await db.query(
            `SELECT * FROM final_academic_records WHERE record_id = ?`,
            [recordId]
        );
        if(existingRecord.length === 0) return { error: 'Registro académico no encontrado.' };
        // Si existe, se procede a actualizar el registro
        const fields = [];
        const values = [];
        Object.entries(fieldsToUpdate).forEach(([key, value]) => {
            fields.push(`${key} = ?`);
            values.push(value);
        });
        values.push(recordId); // Para la cláusula WHERE
        const updatedRecords = await db.query(
            `UPDATE final_academic_records SET ${fields.join(', ')} WHERE record_id = ?`,
            values
        );
        // Se obtiene el registro actualizado
        const [updatedRecord] = await db.query(
            `SELECT * FROM final_academic_records WHERE record_id = ?`,
            [recordId]
        );
        return {
            message: 'Registro académico actualizado correctamente.',
            academicRecord: updatedRecord[0]
        }
    }

    // Método para eliminar un registro académico
    static async deleteAcademicRecord(recordId){
        if(!recordId) return { error: 'Se requiere el ID del registro académico para eliminar.' };
        // Se verifica que exista el registro académico
        const [existingRecord] = await db.query(
            `SELECT * FROM final_academic_records WHERE record_id = ?`,
            [recordId]
        );
        if(existingRecord.length === 0) return { error: 'Registro académico no encontrado.' };
        // Si existe, se elimina el registro académico
        await db.query(
            `DELETE FROM final_academic_records WHERE record_id = ?`,
            [recordId]
        );
        return { message: 'Registro académico eliminado correctamente.' };
    }
}